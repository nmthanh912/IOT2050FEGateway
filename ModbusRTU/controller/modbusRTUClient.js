const modbusRTU = require('modbus-serial')

const getConfig = require('./configInfo')
const Queue = require('../utils/queue')
const {DataFormat, DataDecode} = require('../dataParser/index')
const {RegEncode} = require('./handleRegister')
const removeAccents = require('../utils/removeAccents')
const redis = require('../redis/redisClient')
redis.pubConnection()

class DeviceConnection {
    constructor(deviceConfig, tagList, client) {
        this.deviceConfig = deviceConfig
        this.tagList = tagList
        this.client = client
        this.dataLoopRef = null
        this.valueLoopRef = null
    }

    #run() {
        const tagNumber = this.tagList.length
        const listRegEncoded = RegEncode(this.tagList)
        const queue = new Queue(listRegEncoded)
        const dataFormat = DataFormat(this.deviceConfig.byteOrder, this.deviceConfig.wordOrder)
        const dataList = []
        const deviceName = removeAccents(this.deviceConfig.name)
        this.#getData(this.deviceConfig, dataFormat, queue, tagNumber, dataList)

        this.dataLoopRef = setInterval(() => {
            redis.pub2Redis(`data/${deviceName}`, dataList)
            console.log(dataList)
        }, this.deviceConfig.scanningCycle * 1000)
    }

    #getData(deviceConfig, dataFormat, queue, tagNumber, dataList) {
        if (this.valueLoopRef) {
            clearInterval(this.valueLoopRef)
        }
        var position = 0

        this.valueLoopRef = setInterval(async () => {
            if (position === tagNumber) {
                position = 0
            }
            const regEncoded = queue.dequeue()
            try {
                await this.client.setID(deviceConfig.slaveid)
                await this.client
                    .readHoldingRegisters(regEncoded.init.address, regEncoded.init.size)
                    .then((data) => {
                        var buf = Buffer.allocUnsafe(regEncoded.init.size * 2)
                        buf = data.buffer

                        var i = 0
                        regEncoded.tagList.forEach((tag) => {
                            const bufDecoded = buf.slice(i, tag.size * 2 + i)
                            i += tag.size * 2
                            const valueDecoded = DataDecode(dataFormat, tag.dataType, tag.PF, bufDecoded)
                            dataList[position] = {
                                name: tag.name,
                                unit: tag.unit,
                                value: valueDecoded,
                            }
                            position += 1
                        })
                    })
                    .catch((err) => {
                        redis.pub2Redis('log', {serviceName: 'ModbusRTU', level: 'error', errMsg: err})
                        console.error('Read registers error!', err)
                    })
            } catch (err) {
                redis.pub2Redis('log', {serviceName: 'ModbusRTU', level: 'error', errMsg: err})
            }
            queue.enqueue(regEncoded)
        }, 250)
    }

    poweron() {
        if (this.deviceConfig && this.client) {
            this.#run()
        }
    }

    shutdown() {
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
        this.client = null
    }

    async #connection(comPortNum, options) {
        if (this.#pool.length === 0) {
            this.client = new modbusRTU()
            try {
                await this.client.connectRTUBuffered(comPortNum, options)
                this.client.setTimeout(500)
            } catch (err) {
                redis.pub2Redis('log', {serviceName: 'ModbusRTU', level: 'error', errMsg: err})
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
            redis.pub2Redis('log', {serviceName: 'ModbusRTU', level: 'error', errMsg: err})
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
