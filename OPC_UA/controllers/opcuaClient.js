const {OPCUAClient, AttributeIds, resolveNodeId, TimestampsToReturn} = require('node-opcua')
const async = require('async')

const getConfig = require('./configInfo')
const removeAccents = require('../utils/removeAccents')
const redis = require('../redis/redisClient')
redis.pubConnection()

function createClient() {
    return (client = OPCUAClient.create({
        endpointMustExist: false,
    }))
}

function getData(deviceConfig, nodeList, client, callback) {
    const endpoint = deviceConfig.url
    const dataList = []
    let dataLoopRef = null
    let theSession = null
    let theSubscription = null

    client.on('backoff', (retry, delay) => {
        if (dataLoopRef) {
            clearInterval(dataLoopRef)
        }
        redis.pub2Redis('log', {
            serviceName: 'OPC_UA',
            level: 'info',
            errMsg: `still trying to connect to ${endpoint}: retry = ${retry}, next attempt in ${delay / 1000} seconds`,
        })
        console.log(
            'still trying to connect to ',
            endpoint,
            ': retry =',
            retry,
            'next attempt in ',
            delay / 1000,
            'seconds'
        )
    })

    async.series(
        [
            function (callback) {
                client.connect(endpoint, function (err) {
                    if (err) {
                        redis.pub2Redis('log', {serviceName: 'OPC_UA', level: 'error', errMsg: err})
                        console.log(' Cannot connect to endpoint :', endpoint)
                    } else {
                        redis.pub2Redis('log', {serviceName: 'OPC_UA', level: 'info', errMsg: 'Connected!'})
                        console.log('Connected!')
                    }
                    callback(err)
                })
            },

            function (callback) {
                client.createSession(function (err, session) {
                    if (err) {
                        redis.pub2Redis('log', {serviceName: 'OPC_UA', level: 'error', errMsg: err})
                        return callback(err)
                    }
                    theSession = session
                    callback()
                })
            },

            function (callback) {
                theSession.browse('RootFolder', function (err, browseResult) {
                    if (!err) {
                        console.log('Browsing rootfolder: ')
                        redis.pub2Redis('log', {serviceName: 'OPC_UA', level: 'info', errMsg: 'Browsing rootfolder: '})

                        for (let reference of browseResult.references) {
                            redis.pub2Redis('log', {
                                serviceName: 'OPC_UA',
                                level: 'info',
                                errMsg: `${(reference.browseName.toString(), reference.nodeId.toString())}`,
                            })
                            console.log(reference.browseName.toString(), reference.nodeId.toString())
                        }
                    }
                    callback(err)
                })
            },

            function (callback) {
                const subscriptionOptions = {
                    maxNotificationsPerPublish: 1000,
                    publishingEnabled: true,
                    requestedLifetimeCount: 100,
                    requestedMaxKeepAliveCount: 10,
                    requestedPublishingInterval: 1000,
                }

                theSession.createSubscription2(subscriptionOptions, (err, subscription) => {
                    if (err) {
                        redis.pub2Redis('log', {serviceName: 'OPC_UA', level: 'error', errMsg: err})
                        return callback(err)
                    }

                    theSubscription = subscription

                    theSubscription
                        .on('started', () => {
                            redis.pub2Redis('log', {
                                serviceName: 'OPC_UA',
                                level: 'info',
                                errMsg: `Subscription started for 2 seconds - subscriptionId = ${theSubscription.subscriptionId}`,
                            })
                            console.log(
                                'subscription started for 2 seconds - subscriptionId=',
                                theSubscription.subscriptionId
                            )
                        })
                        .on('keepalive', function () {
                            redis.pub2Redis('log', {
                                serviceName: 'OPC_UA',
                                level: 'info',
                                errMsg: 'Subscription keepalive',
                            })
                            console.log('subscription keepalive')
                        })
                        .on('terminated', function () {
                            redis.pub2Redis('log', {serviceName: 'OPC_UA', level: 'info', errMsg: 'Terminated'})
                            console.log('terminated')
                        })
                    callback()
                })
            },

            function (callback) {
                const monitoringParamaters = {
                    samplingInterval: 250,
                    discardOldest: true,
                    queueSize: 10,
                }

                let itemToMonitor = {}
                nodeList.forEach((node, index) => {
                    {
                        itemToMonitor = {
                            nodeId: resolveNodeId(node.nodeid),
                            attributeId: AttributeIds.Value,
                        }

                        theSubscription.monitor(
                            itemToMonitor,
                            monitoringParamaters,
                            TimestampsToReturn.Both,
                            (err, monitoredItem) => {
                                monitoredItem.on('changed', function (dataValue) {
                                    dataList[index] = {
                                        name: node.name,
                                        value: dataValue.value.value,
                                        unit: node.unit,
                                    }
                                })
                            }
                        )
                    }
                })
                dataLoopRef = setInterval(() => {
                    const deviceName = removeAccents(deviceConfig.name)
                    redis.pub2Redis(`data/${deviceName}`, dataList)
                    console.log(dataList)
                }, deviceConfig.scanningCycle * 1000)
                callback()
            },
        ],
        function (err, results) {
            if (err) {
                redis.pub2Redis('log', {serviceName: 'OPC_UA', level: 'error', errMsg: err})
                console.log('Failure!', err)
            } else {
                redis.pub2Redis('log', {serviceName: 'OPC_UA', level: 'info', errMsg: 'Done'})
                console.log('Done!')
            }
            callback(err, theSession, theSubscription, client, dataLoopRef)
        }
    )
}

class DeviceConnection {
    #pool
    constructor() {
        this.#pool = []
    }

    async poweron(deviceID) {
        try {
            const configInfo = await getConfig('OPC_UA', deviceID)

            if (configInfo.length > 0) {
                const client = createClient()
                this.#pool.push({
                    deviceID,
                    client,
                })

                getData(
                    configInfo[0].deviceConfig[0],
                    configInfo[0].nodeInfo,
                    client,
                    (err, theSession, theSubscription, client, dataLoopRef) => {
                        const connection = this.#pool.find((conn) => conn.deviceID === deviceID)
                        if (connection !== undefined) {
                            connection.theSession = theSession
                            connection.theSubscription = theSubscription
                            connection.dataLoopRef = dataLoopRef
                        }
                    }
                )
            } else {
                throw new Error('No tags provided!')
            }
        } catch (err) {
            redis.pub2Redis('log', {serviceName: 'OPC_UA', level: 'error', errMsg: err})
            console.log(err)
            throw err
        }
    }

    shutdown(deviceID) {
        const connection = this.#pool.find((conn) => conn.deviceID === deviceID)
        if (connection !== undefined) {
            this.#pool.splice(this.#pool.indexOf(connection), 1)
            connection.client.disconnect(() => {})
            delete connection.deviceID
            delete connection.client
            
            if (Object.keys(connection).length !== 0) {
                connection.theSubscription.terminate(() => {})
                connection.theSession.close((err) => {
                    if (err) {
                        redis.pub2Redis('log', {serviceName: 'OPC_UA', level: 'error', errMsg: err})
                        console.log('closing session failed!', err)
                    }
                })
                clearInterval(connection.dataLoopRef)
            }
        }
    }

    getRunningDevices() {
        return this.#pool.map((connection) => connection.deviceID)
    }
}

module.exports = DeviceConnection
