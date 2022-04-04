const {OPCUAClient, makeBrowsePath, AttributeIds, resolveNodeId, TimestampsToReturn} = require('node-opcua')
const async = require('async')

const getConfig = require('./configInfo')

function getData(deviceConfig, nodeList, callback) {
    const endpoint = deviceConfig.url
    const client = OPCUAClient.create({
        endpointMustExist: false,
    })

    const dataList = []
    let dataLoopRef = null
    let theSession = null
    let theSubscription = null

    client.on('backoff', (retry, delay) => {
        if (dataLoopRef) {
            clearInterval(dataLoopRef)
        }
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
                        console.log(' cannot connect to endpoint :', endpoint)
                    } else {
                        console.log('connected!')
                    }
                    callback(err)
                })
            },

            function (callback) {
                client.createSession(function (err, session) {
                    if (err) {
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
                        for (let reference of browseResult.references) {
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
                        console.log('error here')
                        return callback(err)
                    }

                    theSubscription = subscription

                    theSubscription
                        .on('started', () => {
                            console.log(
                                'subscription started for 2 seconds - subscriptionId=',
                                theSubscription.subscriptionId
                            )
                        })
                        .on('keepalive', function () {
                            console.log('subscription keepalive')
                        })
                        .on('terminated', function () {
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
                    console.log(dataList)
                }, deviceConfig.scanningCycle * 1000)
                callback()
            },
        ],
        function (err, results) {
            if (err) {
                console.log('Failure!', err)
            } else {
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
                getData(
                    configInfo[0].deviceConfig[0],
                    configInfo[0].nodeInfo,
                    (err, theSession, theSubscription, client, dataLoopRef) => {
                        this.#pool.push({
                            deviceID: deviceID,
                            theSession: theSession,
                            theSubscription: theSubscription,
                            client: client,
                            dataLoopRef: dataLoopRef,
                        })
                    }
                )
            }
        } catch (err) {
            console.log(err)
        }
    }

    shutdown(deviceID) {
        const connection = this.#pool.find((conn) => conn.deviceID === deviceID)
        if (connection !== undefined) {
            connection.theSubscription.terminate(() => {})
            connection.theSession.close((err) => {
                if (err) {
                    console.log('closing session failed!', err)
                }
            })
            connection.client.disconnect(() => {})
            clearInterval(connection.dataLoopRef)
        }
    }
}

module.exports = DeviceConnection
