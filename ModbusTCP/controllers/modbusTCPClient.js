const modbus = require('jsmodbus')
const net = require('net')

const getConfig = require('./configInfo')
const timer = require('../utils/timer')
const Queue = require('../utils/queue')
const { DataFormat, DataDecode } = require('../dataParser/index')
const { RegEncode } = require('./handleRegister')
const removeAccents = require('../utils/removeAccents')
const redis = require('../redis/redisClient')
redis.pubConnection()

class DeviceConnection {
    constructor(configInfo) {
        this.deviceConfig = configInfo.deviceConfig[0]
        this.tagList = configInfo.tagInfo
        this.time = 1
        this.dataLoopRef = null
        this.valueLoopRef = null
    }

    #setup() {
        const socket = new net.Socket()
        const client = new modbus.client.TCP(socket, this.deviceConfig.slaveid)
        const options = this.deviceConfig.options
        this.pool = { socket, client, options }
    }

    #connect() {
        const { socket, client, options } = this.pool
        socket.connect(options)

        socket.on('connect', () => {
            redis.pub2Redis('log', { serviceName: 'ModbusTCP', level: 'info', errMsg: 'Socket connected!' })
            const listRegEncoded = RegEncode(this.tagList)
            const queue = new Queue(listRegEncoded)
            const dataFormat = DataFormat(this.deviceConfig.byteOrder, this.deviceConfig.wordOrder)
            this.#getData(client, dataFormat, queue, this.tagList.length)
        })

        socket.on('error', (err) => {
            redis.pub2Redis('log', { serviceName: 'ModbusTCP', level: 'error', errMsg: err })
            console.log('Socket error!', err)
            socket.end()
            socket.destroy()
        })

        socket.on('close', (err) => {
            redis.pub2Redis('log', { serviceName: 'ModbusTCP', level: 'error', errMsg: `Socket close: ${err}` })
            console.log('Socket close!', err)
            if (this.dataLoopRef) {
                clearInterval(this.dataLoopRef)
            }
            if (this.valueLoopRef) {
                clearInterval(this.valueLoopRef)
            }
            socket.end()
            this.time = timer(err, this.deviceConfig.minRespTime, this.time)
            setTimeout(() => socket.connect(options), this.time * 1000)
        })
    }

    #getData(client, dataFormat, queue, tagNumber) {
        if (this.valueLoopRef) {
            clearInterval(this.valueLoopRef)
        }

        const dataList = []
        const deviceName = removeAccents(this.deviceConfig.name)
        let buf, i, regEncoded, tagBuf, valueDecoded, position = 0

        this.valueLoopRef = setInterval(() => {
            regEncoded = queue.dequeue()
            client
                .readHoldingRegisters(regEncoded.init.address, regEncoded.init.size)
                .then((resp) => {
                    if (position >= tagNumber) position = 0
                    buf = resp.response._body._valuesAsBuffer

                    i = 0
                    regEncoded.tagList.forEach((tag) => {
                        tagBuf = buf.slice(i, tag.size * 2 + i)
                        i += tag.size * 2
                        valueDecoded = DataDecode(dataFormat, tag.dataType, tag.PF, tagBuf)
                        if (position < tagNumber) {
                            dataList[position] = {
                                name: tag.name,
                                unit: tag.unit,
                                value: valueDecoded,
                                timestamp: Date.now()
                            }
                        }
                        position += 1
                    })
                })
                .catch((err) => {
                    redis.pub2Redis('log', { serviceName: 'ModbusTCP', level: 'error', errMsg: err })
                    console.log('Read register error!', err)
                })
            queue.enqueue(regEncoded)
        }, 250)

        this.dataLoopRef = setInterval(() => {
            redis.pub2Redis(`data/${deviceName}`, dataList)
            console.log(`${deviceName}`, dataList)
        }, this.deviceConfig.scanningCycle * 1000)
    }

    poweron() {
        if (typeof this.configInfo !== 'null') {
            this.#setup()
            this.#connect()
        }
    }

    shutdown() {
        this.pool.socket.destroy()
        this.pool.socket.removeAllListeners('close', () => { })
        delete this.pool.socket
        if (this.dataLoopRef) {
            clearInterval(this.dataLoopRef)
        }
        if (this.valueLoopRef) {
            clearInterval(this.valueLoopRef)
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
            } else {
                throw new Error('No tags provided!')
            }
        } catch (err) {
            redis.pub2Redis('log', { serviceName: 'ModbusTCP', level: 'error', errMsg: err })
            console.log(err)
            throw err
        }
    }

    shutdown(deviceID) {
        const connection = this.#pool.find((conn) => conn.deviceConfig.ID === deviceID)
        if (typeof connection !== 'undefined') {
            connection.shutdown()
            this.#pool.splice(this.#pool.indexOf(connection), 1)
        }
    }

    getRunningDevices() {
        return this.#pool.map((connection) => connection.deviceConfig.ID)
    }
}

module.exports = DeviceConnectionPool
