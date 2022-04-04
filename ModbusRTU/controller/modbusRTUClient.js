const modbusRTU = require('modbus-serial')

const getConfig = require('./configInfo')
const timer = require('../utils/timer')
const Queue = require('../utils/queue')
const {DataFormat, DataDecode} = require('../dataParser/index')
const {RegEncode} = require('./handleRegister')

class DeviceConnection {
    constructor(deviceConfig, tagList, client) {
        this.deviceConfig = deviceConfig
        this.tagList = tagList
        this.client = client
        this.time = 1
        this.dataLoopRef = null
        this.valueLoopRef = null
    }

    #run() {
        const tagNumber = this.tagList.length
        const listRegEncoded = RegEncode(this.tagList)
        const queue = new Queue(listRegEncoded)
        const dataFormat = DataFormat(this.deviceConfig.byteOrder, this.deviceConfig.wordOrder)
        const dataList = []
        this.#getData(this.deviceConfig, dataFormat, queue, tagNumber, dataList)

        this.dataLoopRef = setInterval(() => {
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
                        console.error('Read registers error!', err)
                    })
            } catch (err) {
                console.log(err)
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
        this.time = 1
    }

    async #connection(comPortNum, options) {
        if (this.#pool.length === 0) {
            this.client = new modbusRTU()
            try {
                await this.client.connectRTUBuffered(comPortNum, options)
                this.client.setTimeout(500)
            } catch (err) {
                console.log('error connection', err)
            }
        }
    }

    async poweron(deviceID) {
        try {
            const configInfo = await getConfig('MODBUSRTU', deviceID)
            if (configInfo.length > 0) {
                const deviceConfig = configInfo[0].deviceConfig[0]
                const tagList = configInfo[0].tagInfo
                await this.#connection(deviceConfig.comPortNum, deviceConfig.options)

                const connection = new DeviceConnection(deviceConfig, tagList, this.client)
                connection.poweron()
                this.#pool.push(connection)
            }
        } catch (err) {
            console.log(err)
        }
    }

    shutdown(deviceID) {
        const connection = this.#pool.find((conn) => conn.deviceConfig.ID === deviceID)
        if (connection !== null) {
            connection.shutdown()
            this.#pool.slice(this.#pool.indexOf(connection), 1)
            if (this.#pool.length === 0) {
                client.close()
            }
        }
    }
}

module.exports = DeviceConnectionPool
