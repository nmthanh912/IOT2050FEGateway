const mqtt = require('mqtt')
const modbusRTU = require('modbus-serial')

const getConfig = require('./getConfig')

// open connection to serial port
const client = new modbusRTU()
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
var mqttClient

const getData = async (configInfos) => {
    try {
        for (let config of configInfos) {
            await getValue(config)
        }
    } catch (err) {
        console.log(err)
    } finally {
        await sleep(3000)
        setImmediate(() => {
            getData(configInfos)
        })
    }
}

const getValue = async (config) => {
    try {
        await client.setID(config.slaveid)

        const tags = config.tagInfo
        for (let tag of tags) {
            await client
                .readHoldingRegisters(parseInt(tag.address), 2)
                .then((data) => {
                    let buf = Buffer.allocUnsafe(4)

                    buf.writeUInt16BE(data.data[0], 0)
                    buf.writeUInt16BE(data.data[1], 2)

                    let value = parseFloat(buf.readFloatBE().toFixed(2))
                    console.log(tag.name, value)

                    mqttClient.publish('topic', JSON.stringify(value))
                })
                .catch((err) => {
                    console.error(err)
                })
        }
    } catch (err) {
        console.log(err)
    }
}

const main = async () => {
    try {
        const configInfos = await getConfig('MODBUSRTU')
        console.log(configInfos)

        if (configInfos.length > 0) {
            mqttClient = mqtt.connect(`mqtt://${configInfos[0].mqttIP}:${configInfos[0].mqttPort}`, {
                username: configInfos[0].mqttUsername,
                password: configInfos[0].mqttPassword,
            })

            client
                .connectRTUBuffered(configInfos[0].com_port_num, {
                    baudRate: configInfos[0].baudrate,
                    dataBits: configInfos[0].databits,
                    parity: configInfos[0].parity,
                    stopBits: configInfos[0].stopbits,
                })
                .catch((err) => {
                    console.log(err)
                })
            client.setTimeout(500)

            getData(configInfos)
        }
    } catch (err) {
        console.log(err)
    }
}
main()
