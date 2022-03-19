const modbus = require('jsmodbus')
const net = require('net')
const mqtt = require('mqtt')

const getConfig = require('./getConfig')

const getData = (configInfos) => {
    // console.log(configInfos)
    const mqttClient = mqtt.connect(`mqtt://${configInfos[0].mqttIP}:${configInfos[0].mqttPort}`, {
        username: configInfos[0].mqttUsername,
        password: configInfos[0].mqttPassword,
    })

    configInfos.forEach((config) => {
        const socket = new net.Socket()
        const client = new modbus.client.TCP(socket, config.slaveid)
        const options = {
            host: config.ip,
            port: config.port,
        }

        socket.on('connect', () => {
            setInterval(() => {
                config.tagInfo.forEach((tag) => {
                    client
                        .readHoldingRegisters(tag.address, 2)
                        .then((resp) => {
                            let buf = Buffer.allocUnsafe(4)
                            buf.writeUint16BE(resp.response._body.valuesAsArray[0], 0)
                            buf.writeUInt16BE(resp.response._body.valuesAsArray[1], 2)

                            let value = parseFloat(buf.readFloatBE().toFixed(2))
                            console.log(tag.name, value)

                            mqttClient.publish('topic', JSON.stringify(value))
                        })
                        .catch((err) => {
                            socket.end()
                            console.error(err)
                        })
                })
            }, 3000)
        })

        socket.on('error', (err) => {
            socket.end()
            console.error(err)
        })

        socket.connect(options)
    })
}

const main = async () => {
    try {
        const configInfos = await getConfig('MODBUSTCP')

        if (configInfos.length > 0) {
            getData(configInfos)
        }
    } catch (err) {
        console.log(err)
    }
}
main()
