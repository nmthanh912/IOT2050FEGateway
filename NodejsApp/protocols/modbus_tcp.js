require('dotenv').config()
var modbus = require('jsmodbus')
const net = require('net')

// mqtt client
const mqtt = require('mqtt')

// SQLite
const {db, dbAll, dbRun} = require('../models/database')

// let devices = []
// let mqttTopic = []
// main()
// async function main() {
//     await getDevice()
//     setTimeout(getDataFromDevice, 2000)
// }

// const getConfig = 'SELECT * FROM MODBUSTCP'
// const configParams = []

// const getTag = 'SELECT * FROM MODBUSTCP_TAG WHERE deviceID = ?'
// const tagParams = []

const getDevice = async () => {
    const getDevice = 'SELECT * FROM DEVICE WHERE protocolType = ?'
    const deviceParams = ['MODBUSTCP']

    try {
        const devicesInfo = await dbAll(getDevice, deviceParams)
        return devicesInfo
    } catch (err) {
        console.log(err)
    }
}

console.log(getDevice())

// db.all(getDevice, params, (err, rows) => {
//     if (err) {
//         console.log('DB has error ', err.message)
//     }
//     rows.forEach(function (row) {
//         let dv = {
//             id: row.id,
//             name: row.name,
//             ip: row.ip,
//             port: row.port,
//             slave: row.slave,
//             fc_type: row.fc_type,
//             tags: [],
//         }

//         // Read tag_config table with device_id
//         const tagQuerry = 'SELECT * FROM tag_config WHERE device_id = ?'
//         var params1 = [parseInt(row.id)]
//         db.all(tagQuerry, params1, (err, row1s) => {
//             if (err) {
//                 console.log(err)
//             }
//             row1s.forEach(function (row1) {
//                 dv.tags.push({
//                     name: row1.name,
//                     tag: row1.tag,
//                     addr: row1.address,
//                     unit: row1.unit,
//                     length: row1.length,
//                     value_type: row1.value_type,
//                     id: row1.id,
//                 })
//             })
//             devices.push(dv)
//         })
//     })

//     // Config mqtt broker
//     mqttQuery = 'SELECT * FROM mqtt_config'
//     params = []
//     db.all(mqttQuery, params, (err, rows) => {
//         if (err) {
//             console.log('DB has error ', err.message)
//         }
//         if (rows.length > 0) {
//             rows.forEach((row) => {
//                 mqttTopic.push(row)
//             })
//         }
//         options = {
//             username: mqttTopic[0].username,
//             password: mqttTopic[0].password,
//         }
//     })
// }

async function getDataFromDevice() {
    const mqttClient = mqtt.connect('mqtt://' + mqttTopic[0].ip + ':' + mqttTopic[0].port, options)

    if (devices.length > 0) {
        devices.forEach((device) => {
            if (device.tags.length > 0) {
                const options = {
                    host: device.ip,
                    port: device.port,
                }
                let socket = new net.Socket()
                let client = new modbus.client.TCP(socket, device.slave)
                socket.connect(options)
                socket.on('connect', async function () {
                    let tags = device.tags
                    setInterval(async function (args) {
                        let arrSaveData = []
                        for (let i = 0; i < tags.length; i++) {
                            await client
                                .readHoldingRegisters(tags[i].addr, 2)
                                .then(function (resp) {
                                    let buf = Buffer.allocUnsafe(4)
                                    if (tags[i].value_type == 1) {
                                        buf.writeUInt16BE(resp.response._body._valuesAsArray[0], 0)
                                        buf.writeUInt16BE(resp.response._body._valuesAsArray[1], 2)
                                    } else {
                                        buf.writeUInt16BE(resp.response._body._valuesAsArray[0], 2)
                                        buf.writeUInt16BE(resp.response._body._valuesAsArray[1], 0)
                                    }
                                    tmp = {
                                        id: tags[i].id,
                                        name: tags[i].name,
                                        tag: tags[i].tag,
                                        unit: tags[i].unit,
                                        addr: tags[i].addr,
                                        value: parseFloat(buf.readFloatBE().toFixed(2)),
                                    }
                                    console.log('name: ', tmp.name, ',', 'value: ', tmp.value)
                                    arrSaveData.push(tmp)
                                })
                                .catch(function () {
                                    console.error(arguments)
                                })

                            let insertQuerry =
                                'INSERT INTO modbusTCPValue (name_device, id_device, tag_name, tag, unit, value, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)'
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
                            // Save to file:
                            await csv.toDisk('./csv/modbusTCPValue.csv', {append: true})

                            data = JSON.stringify(dataInsertToCSV)
                            for (let i = 0; i < mqttTopic.length; i++) {
                                mqttClient.publish(mqttTopic[i].topic, data)
                            }
                        }

                        if (arrSaveData.length > 0) {
                            arr = {
                                device_id: device.id,
                                device: device.name,
                                value: arrSaveData,
                                timestamp: new Date(),
                                type: device.fc_type,
                                flag: 0,
                            }
                            ioClient.emit('modbus_tcp', arr)
                        }
                    }, 5000)
                })

                socket.on('error', function (err) {
                    socket.end()
                    socket.destroy()
                })

                socket.on('close', function () {
                    socket.end()
                    socket.connect(options)
                })
            }
        })
    }
}
