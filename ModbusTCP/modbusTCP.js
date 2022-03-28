require('dotenv').config()
const modbus = require('jsmodbus')
const net = require('net')

const getConfig = require('./getConfig')
const timerReconnect = require('./utils/timer')

const timeDelay = process.env.TIME_DELAY

class DeviceConnection {
    constructor(configInfo = null, deviceID) {
        this.configInfo = configInfo
        this.deviceID = deviceID
    }

    setConfigInfo(configInfo) {
        this.configInfo = configInfo
    }

    #setup() {
        const socket = new net.Socket()
        const client = new modbus.client.TCP(socket, this.configInfo.slaveid)
        const options = {
            host: this.configInfo.ip,
            port: this.configInfo.port,
        }

        this.pool = {socket, client, options, tagList: this.configInfo.tagInfo}
    }

    #connect() {
        const {socket, client, options, tagList} = this.pool
        var timer = 1
        var intervalTimer

        socket.connect(options)

        socket.on('connect', () => {
            intervalTimer = setInterval(() => {
                this.#getData(client, tagList)
                this.pool.intervalTimer = intervalTimer
            }, 3000)
        })

        socket.on('error', (err) => {
            console.log('socket error!', err)
            socket.end()
            socket.destroy()
        })

        socket.on('close', (err) => {
            console.log('socket close!', err)
            if (intervalTimer) {
                clearInterval(intervalTimer)
            }
            socket.end()
            timer = timerReconnect(err, timeDelay, timer)
            setTimeout(() => socket.connect(options), timer * 1000)
        })
    }

    #getData(client, tagList) {
        tagList.forEach((tag) => {
            client
                .readHoldingRegisters(tag.address, 2)
                .then((resp) => {
                    let buf = Buffer.allocUnsafe(4)

                    buf.writeUint16BE(resp.response._body.valuesAsArray[0], 0)
                    buf.writeUInt16BE(resp.response._body.valuesAsArray[1], 2)

                    let value = parseFloat(buf.readFloatBE().toFixed(2))
                    console.log(tag.name, value)
                })
                .catch((err) => {
                    console.log('client error!', err)
                })
        })
    }

    poweron() {
        if (this.configInfo !== null) {
            this.#setup()
            this.#connect()
        }
    }

    shutdown() {
        this.pool.socket.end()
        this.pool.socket.destroy()
        clearInterval(this.pool.intervalTimer)
    }
}

class DeviceConnectionPool {
    #pool
    constructor() {
        this.#pool = []
    }

    async poweron(deviceID) {
        try {
            const configInfo = await getConfig('MODBUSTCP', deviceID)
            if (configInfo.length > 0) {
                const connection = new DeviceConnection(configInfo[0], deviceID)
                connection.poweron()
                this.#pool.push(connection)
            }
        } catch (err) {
            console.log(err)
        }
    }

    shutdown(deviceID) {
        const connection = this.#pool.find(conn => conn.deviceID === deviceID)
        connection.shutdown()
    }
}

module.exports = DeviceConnectionPool
