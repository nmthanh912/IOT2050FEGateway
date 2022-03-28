require('dotenv').config()
const modbus = require('jsmodbus')
const net = require('net')
const Redis = require('ioredis')

const getConfig = require('./getConfig')
const timerReconnect = require('./utils/timer')

const redis = new Redis()
const create = 'CREATE'
const update = 'UPDATE'
const drop = 'DROP'

const timeDelay = process.env.TIME_DELAY

redis.subscribe(create, update, drop, (err) => {
    if (err) {
        console.error(err.message)
    } else {
        console.log('Subscribe successfully!')
    }
})

redis.on('message', (channel, message) => {
    if (channel === create) {
        console.log(JSON.parse(message))
    } else if (channel === update) {
        console.log(JSON.parse(message))
    } else if (channel === drop) {
        console.log(JSON.parse(message))
    }
})

class DataConnectionPool {
    constructor(configInfos = null) {
        this.configInfos = configInfos
    }

    setConfigInfos(configInfos) {
        this.configInfos = configInfos
    }

    #setupPool() {
        this.pool = this.configInfos.map((config) => {
            const socket = new net.Socket()
            const client = new modbus.client.TCP(socket, config.slaveid)
            const options = {
                host: config.ip,
                port: config.port,
            }
            return {socket, client, options, tagList: config.tagInfo}
        })
    }

    getData(client, tagList, id) {
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
                    console.log('error here')
                    console.log(err)
                    clearInterval(id)
                })
        })
    }

    #setupConnection() {
        this.configInfos.forEach((config) => {
            const socket = new net.Socket()
            const client = new modbus.client.TCP(socket, config.slaveid)
            const options = {
                host: config.ip,
                port: config.port,
            }
            var timer = 1
            var intervalTimer

            socket.connect(options)

            socket.on('connect', () => {
                intervalTimer = setInterval(() => {
                    config.tagInfo.forEach((tag) => {
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
                setTimeout(() => socket.connect(options), timer*1000)
            })
        })
    }

    #disconnectAll() {
        this.pool.forEach((connection) => {
            connection.socket.end()
            // clearInterval(connection.id)
        })
    }

    run() {
        if (this.configInfos !== null) {
            // this.#setupPool()
            this.#setupConnection()
        }
    }

    reset() {
        this.#disconnectAll()
        // this.#setupPool()
        this.#setupConnection()
    }
}

class Process {
    #connectionPool
    constructor() {
        this.#connectionPool = new DataConnectionPool()
    }
    async run(reset = false) {
        try {
            const configInfos = await getConfig('MODBUSTCP')
            console.log('config', configInfos)

            if (configInfos.length > 0) {
                this.#connectionPool.setConfigInfos(configInfos)
                !reset ? this.#connectionPool.run() : this.#connectionPool.reset()
            }
        } catch (err) {
            console.log(err)
        }
    }
}

module.exports = Process
