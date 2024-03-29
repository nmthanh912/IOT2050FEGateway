const modbusRTU = require('modbus-serial')

const getConfig = require('./configInfo')
const Queue = require('../utils/queue')
const { DataFormat, DataDecode } = require('../dataParser/index')
const { RegEncode } = require('./handleRegister')
const removeAccents = require('../utils/removeAccents')
const redis = require('../redis/redisClient')

class DeviceConnection {
    constructor(deviceConfig, tagList, client) {
        this.deviceConfig = deviceConfig
        this.tagList = tagList
        this.client = client
        this.dataList = []
        this.dataLoopRef = null
        this.valueLoopRef = null
        this.resetLoopRef = null
    }

    #run() {
        const listRegEncoded = RegEncode(this.tagList)
        const queue = new Queue(listRegEncoded)
        const dataFormat = DataFormat(this.deviceConfig.byteOrder, this.deviceConfig.wordOrder)
        this.#handleDataCollection(this.deviceConfig, dataFormat, queue, this.tagList.length)
    }

    async #getData(deviceConfig, dataFormat, queue, tagNumber) {
        let buf, i, regEncoded, tagBuf, valueDecoded, position = 0

        regEncoded = queue.dequeue()
        try {
            await this.client.setID(deviceConfig.slaveid)
            await this.client
                .readHoldingRegisters(regEncoded.init.address, regEncoded.init.size)
                .then((data) => {
                    if (position >= tagNumber) position = 0
                    buf = data.buffer

                    i = 0
                    regEncoded.tagList.forEach((tag) => {
                        tagBuf = buf.slice(i, tag.size * 2 + i)
                        i += tag.size * 2
                        valueDecoded = DataDecode(dataFormat, tag.dataType, tag.PF, tagBuf)
                        if (position < tagNumber) {
                            this.dataList[position] = {
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
                    redis.pub2Redis('log', { serviceName: 'ModbusRTU', level: 'error', errMsg: err })
                    console.error('Read registers error!', err)
                })
        } catch (err) {
            redis.pub2Redis('log', { serviceName: 'ModbusRTU', level: 'error', errMsg: err })
        }
        queue.enqueue(regEncoded)
    }

    #pubData() {
        const deviceName = removeAccents(this.deviceConfig.name)
        redis.pub2Redis(`data/${deviceName}`, this.dataList)
        console.log(`${deviceName}`, this.dataList)
    }

    #handleDataCollection(deviceConfig, dataFormat, queue, tagNumber) {
        if (this.valueLoopRef) {
            clearInterval(this.valueLoopRef)
        }

        this.valueLoopRef = setInterval(() => {
            this.#getData(deviceConfig, dataFormat, queue, tagNumber)
        }, 250)

        this.dataLoopRef = setInterval(() => {
            this.#pubData()
        }, deviceConfig.scanningCycle * 1000)

        this.resetLoopRef = setInterval(() => {
            if (this.valueLoopRef) clearInterval(this.valueLoopRef)
            if (this.dataLoopRef) clearInterval(this.dataLoopRef)

            this.valueLoopRef = setInterval(() => {
                this.#getData(deviceConfig, dataFormat, queue, tagNumber)
            }, 250)

            this.dataLoopRef = setInterval(() => {
                this.#pubData()
            }, deviceConfig.scanningCycle * 1000)
        }, 86400000)
    }

    poweron() {
        if (this.deviceConfig && this.client) {
            this.#run()
        }
    }

    shutdown() {
        if (this.dataLoopRef) clearInterval(this.dataLoopRef)
        if (this.valueLoopRef) clearInterval(this.valueLoopRef)
        if (this.resetLoopRef) clearInterval(this.resetLoopRef)
    }
}

class DeviceConnectionPool {
    #pool
    constructor() {
        this.#pool = []
        this.client = null
    }

    async #connection(comPortNum, options) {
        if (this.#pool.length === 0) {
            this.client = new modbusRTU()
            try {
                await this.client.connectRTUBuffered(comPortNum, options)
                this.client.setTimeout(500)
            } catch (err) {
                redis.pub2Redis('log', { serviceName: 'ModbusRTU', level: 'error', errMsg: err })
                console.log('Error connection!', err)
            }
        }
    }

    async poweron(deviceID) {
        try {
            const configInfo = await getConfig('MODBUSRTU', deviceID)
            if (configInfo.length > 0) {
                const deviceConfig = configInfo[0].deviceConfig[0]
                const tagList = configInfo[0].tagInfo
                if (this.#pool.length === 0) {
                    await this.#connection(deviceConfig.comPortNum, deviceConfig.options)
                }

                const connection = new DeviceConnection(deviceConfig, tagList, this.client)
                connection.poweron()
                this.#pool.push(connection)
            } else {
                throw new Error('No tags provided!')
            }
        } catch (err) {
            redis.pub2Redis('log', { serviceName: 'ModbusRTU', level: 'error', errMsg: err })
            console.log(err)
            throw err
        }
    }

    shutdown(deviceID) {
        const connection = this.#pool.find((conn) => conn.deviceConfig.ID === deviceID)
        if (connection !== undefined) {
            connection.shutdown()
            this.#pool.splice(this.#pool.indexOf(connection), 1)
            if (this.#pool.length === 0) {
                this.client.close()
            }
        }
    }

    getRunningDevices() {
        return this.#pool.map((connection) => connection.deviceConfig.ID)
    }
}

module.exports = DeviceConnectionPool
