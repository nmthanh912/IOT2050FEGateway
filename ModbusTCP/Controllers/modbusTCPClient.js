require('dotenv').config()
const modbus = require('jsmodbus')
const net = require('net')

const getConfig = require('./configInfo')
const timer = require('../utils/timer')
const DataPaser = require('../DataParser/index')

class DeviceConnection {
    constructor(configInfo) {
        this.deviceConfig = {
            ID: configInfo.ID,
            name: configInfo.name,
            byteOrder: configInfo.byteOrder,
            wordOrder: configInfo.wordOrder,
            scanningCycle: configInfo.scanningCycle,
            minRespTime: configInfo.minRespTime,
            slaveid: configInfo.slaveid,
            options: {
                host: configInfo.ip,
                port: configInfo.port,
            },
        }
        this.tagList = configInfo.tagInfo
        this.time = 1
    }

    #setup() {
        const socket = new net.Socket()
        const client = new modbus.client.TCP(socket, this.deviceConfig.slaveid)
        const options = this.deviceConfig.options

        this.pool = {socket, client, options}
    }

    #connect() {
        const {socket, client, options} = this.pool
        socket.connect(options)

        socket.on('connect', () => {
            this.pool.intervalTimer = setInterval(() => {
                this.#getData(client, this.tagList)
            }, this.deviceConfig.scanningCycle * 1000)
        })

        socket.on('error', (err) => {
            console.log('Socket error!', err)
            socket.end()
            socket.destroy()
        })

        socket.on('close', (err) => {
            console.log('Socket close!', err)
            if (this.pool.intervalTimer) {
                clearInterval(this.pool.intervalTimer)
            }
            socket.end()
            this.time = timer(err, this.deviceConfig.minRespTime, this.time)
            console.log(this.time)
            setTimeout(() => socket.connect(options), this.time * 1000)
        })
    }

    #getData(client, tagList) {
        tagList.forEach((tag) => {
            client
                .readHoldingRegisters(tag.address, tag.size)
                .then((resp) => {
                    let buf = Buffer.allocUnsafe(tag.size * 2)
                    buf = resp.response._body._valuesAsBuffer

                    const FormatData = DataPaser(this.deviceConfig.byteOrder, this.deviceConfig.wordOrder)
                    const dataType = tag.dataType

                    if (FormatData === 'Invalid Data Format!') {
                    } else {
                        if (dataType === 'int16') {
                            const value = FormatData.Int16(tag.PF, buf)
                            console.log(value)
                        } else if (dataType === 'uint16') {
                            const value = FormatData.UInt16(tag.PF, buf)
                            console.log(value)
                        } else if (dataType === 'float32') {
                            const value = FormatData.Float(tag.PF, buf)
                            console.log(value)
                        } else if (dataType === 'int32') {
                            const value = FormatData.Int32(tag.PF, buf)
                            console.log(value)
                        } else if (dataType === 'uint32') {
                            const value = FormatData.UInt32(tag.PF, buf)
                            console.log(value)
                        } else if (dataType === 'double') {
                            const value = FormatData.Double(tag.PF, buf)
                            console.log(value)
                        } else if (dataType === 'string') {
                            const value = FormatData.String(buf)
                            console.log(value)
                        } else {
                            console.log('Invalid Data Type!')
                        }
                    }
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
        this.pool.socket.destroy()
        this.pool.socket.removeAllListeners('close', () => {})
        delete this.pool.socket
        if (this.pool.intervalTimer) {
            clearInterval(this.pool.intervalTimer)
        }
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
                const connection = new DeviceConnection(configInfo[0])
                connection.poweron()
                this.#pool.push(connection)
            }
        } catch (err) {
            console.log(err)
        }
    }

    shutdown(deviceID) {
        const connection = this.#pool.find((conn) => conn.deviceConfig.ID === deviceID)
        if (connection !== undefined) {
            connection.shutdown()
            this.#pool.splice(this.#pool.indexOf(connection), 1)
        }
    }
}

module.exports = DeviceConnectionPool
