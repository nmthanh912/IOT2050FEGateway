require('dotenv').config()
// -----------Send data with mqtt------------
const mqtt = require('mqtt')

// -----------Socket io connection------------
const io = require('socket.io-client')
var ip = process.env.IP
ioClient = io.connect(`http://${ip}:4001`)
ioClient.on('connect', function () {
    console.log('IO connected')
})

// ----------Export csv file----------------
const ObjectsToCsv = require('objects-to-csv')

// ---------SQLite DB-----------
var db = require('../models/database')

// --------OPCUA Client---------
const {OPCUAClient, makeBrowsePath, AttributeIds, resolveNodeId, TimestampsToReturn} = require('node-opcua')
const async = require('async')
const {tag} = require('git-rev-sync')

let devices = []
let mqttTopic = []
main()
async function main() {
    await getDevice()
    setTimeout(getDataFromDevice, 2000)
}

async function getDevice() {
    // Read device_config table in sqlite
    const deviceQuerry = 'SELECT * FROM device_opc_config'
    var params = []
    db.all(deviceQuerry, params, (err, rows) => {
        if (err) {
            console.log('DB has error ', err.message)
        }
        rows.forEach(function (row) {
            let dv = {
                id: row.id,
                name: row.name,
                url: row.url,
                tags: [],
            }

            // Read tag_config table with device_id
            const tagQuerry = 'SELECT * FROM tag_opc_config WHERE device_id = ?'
            var params1 = [parseInt(row.id)]
            db.all(tagQuerry, params1, (err, row1s) => {
                if (err) {
                    console.log(err)
                }
                row1s.forEach(function (row1) {
                    dv.tags.push({
                        name: row1.name,
                        tag: row1.tag,
                        nodeID: row1.nodeID,
                        unit: row1.unit,
                        id: row1.id,
                    })
                })
                devices.push(dv)
            })
        })
    })

    // Config mqtt broker
    mqttQuery = 'SELECT * FROM mqtt_config'
    params = []
    db.all(mqttQuery, params, (err, rows) => {
        if (err) {
            console.log('DB has error ', err.message)
        }
        if (rows.length > 0) {
            rows.forEach((row) => {
                mqttTopic.push(row)
            })
        }
        options = {
            username: mqttTopic[0].username,
            password: mqttTopic[0].password,
        }
    })
}

async function getDataFromDevice() {
    const mqttClient = mqtt.connect('mqtt://' + mqttTopic[0].ip + ':' + mqttTopic[0].port, options)

    if (devices.length > 0) {
        devices.forEach((device) => {
            if (device.tags.length > 0) {
                // ----
                let endpointUrl = device.url
                let client = OPCUAClient.create({
                    endpointMustExist: false,
                })
                client.on('backoff', (retry, delay) =>
                    console.log(
                        'still trying to connect to ',
                        endpointUrl,
                        ': retry =',
                        retry,
                        'next attempt in ',
                        delay / 1000,
                        'seconds'
                    )
                )

                let tags = device.tags
                let the_session, the_subscription
                let arrSaveData = []
                async.series(
                    [
                        // step 1 : connect to server
                        function (callback) {
                            client.connect(endpointUrl, function (err) {
                                if (err) {
                                    console.log(' cannot connect to endpoint :', endpointUrl)
                                } else {
                                    console.log('connected !')
                                }
                                callback(err)
                            })
                        },

                        // step 2 : createSession
                        function (callback) {
                            client.createSession(function (err, session) {
                                if (err) {
                                    return callback(err)
                                }
                                the_session = session
                                callback()
                            })
                        },

                        // step 3 : browse
                        function (callback) {
                            the_session.browse('RootFolder', function (err, browseResult) {
                                if (!err) {
                                    console.log('Browsing rootfolder: ')
                                    for (let reference of browseResult.references) {
                                        console.log(reference.browseName.toString(), reference.nodeId.toString())
                                    }
                                }
                                callback(err)
                            })
                        },
                        // step 5: install a subscription and install a monitored item for 10 seconds
                        function (callback) {
                            const subscriptionOptions = {
                                maxNotificationsPerPublish: 1000,
                                publishingEnabled: true,
                                requestedLifetimeCount: 100,
                                requestedMaxKeepAliveCount: 10,
                                requestedPublishingInterval: 1000,
                            }
                            the_session.createSubscription2(subscriptionOptions, (err, subscription) => {
                                if (err) {
                                    return callback(err)
                                }

                                the_subscription = subscription

                                the_subscription
                                    .on('started', () => {
                                        console.log(
                                            'subscription started for 2 seconds - subscriptionId=',
                                            the_subscription.subscriptionId
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
                            // install monitored item
                            const monitoringParamaters = {
                                samplingInterval: 1000,
                                discardOldest: true,
                                queueSize: 10,
                            }

                            let itemToMonitor = {}
                            for (let i = 0; i < tags.length; i++) {
                                itemToMonitor = {
                                    nodeId: resolveNodeId(tags[i].nodeID),
                                    attributeId: AttributeIds.Value,
                                }

                                the_subscription.monitor(
                                    itemToMonitor,
                                    monitoringParamaters,
                                    TimestampsToReturn.Both,
                                    (err, monitoredItem) => {
                                        monitoredItem.on('changed', async function (dataValue) {
                                            tmp = {
                                                id: tags[i].id,
                                                name: tags[i].name,
                                                tag: tags[i].tag,
                                                unit: tags[i].unit,
                                                value: dataValue.value.value,
                                            }

                                            arrSaveData.push(tmp)

                                            let insertQuerry =
                                                'INSERT INTO opcuaValue (name_device, id_device, tag_name, tag, unit, value, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)'
                                            db.run(insertQuerry, [
                                                device.name,
                                                device.id,
                                                tmp.name,
                                                tmp.tag,
                                                tmp.unit,
                                                tmp.value,
                                                new Date(),
                                            ])

                                            var d = new Date()
                                            var month = d.getMonth() + 1
                                            var timeInsert =
                                                d.getDate() +
                                                '-' +
                                                month +
                                                '-' +
                                                d.getFullYear() +
                                                ' ' +
                                                d.getHours() +
                                                ':' +
                                                d.getMinutes() +
                                                ':' +
                                                d.getSeconds()

                                            dataInsertToCSV = [
                                                {
                                                    NameDevice: device.name,
                                                    IDDevice: device.id,
                                                    TagName: tmp.name,
                                                    Tag: tmp.tag,
                                                    Unit: tmp.unit,
                                                    Value: tmp.value,
                                                    TimeStamp: timeInsert,
                                                },
                                            ]

                                            const csv = new ObjectsToCsv(dataInsertToCSV)
                                            // // Save to file:
                                            await csv.toDisk('./csv/opcuaValue.csv', {append: true})

                                            data = JSON.stringify(dataInsertToCSV)
                                            for (let i = 0; i < mqttTopic.length; i++) {
                                                mqttClient.publish(mqttTopic[i].topic, data)
                                            }

                                            console.log('name: ', tmp.name, 'value: ', tmp.value)
                                            console.log('-----------------')
                                            if (arrSaveData.length > 0) {
                                                arr = {
                                                    device_id: device.id,
                                                    device: device.name,
                                                    value: arrSaveData,
                                                    timestamp: new Date(),
                                                    flag: 0,
                                                }
                                                ioClient.emit('opcua_client', arr)
                                            }
                                        })
                                        callback(null)
                                    }
                                )
                            }
                        },
                    ],
                    function (err, results) {
                        if (err) {
                            console.log(' Failure ', err)
                        } else {
                            console.log('Done!')
                        }
                    }
                )
            }
        })
    }
}