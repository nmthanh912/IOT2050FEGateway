const modbus = require('jsmodbus')
const net = require('net')

const getConfig = require('./getConfig')

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

    #setupConnection() {
        this.pool.forEach((connection) => {
            const {socket, client, tagList} = connection
            socket.on('connect', () => {
                const id = setInterval(() => {
                    tagList.forEach((tag) => {
                        client
                            .readHoldingRegisters(tag.address, 2)
                            .then((resp) => {
                                let buf = Buffer.allocUnsafe(4)

                                buf.writeUint16BE(resp.response._body.valuesAsArray[0], 0)
                                buf.writeUInt16BE(resp.response._body.valuesAsArray[1], 2)

                                let value = parseFloat(buf.readFloatBE().toFixed(2))
                                console.log(tag.name, value)

                                // mqttClient.publish('topic', JSON.stringify(value))
                                // console.log("============")
                            })
                            .catch((err) => {
                                console.log('error here')
                                console.log(err)
                            })
                    })
                }, 3000)

                connection.id = id
            })

            socket.on('error', (err) => {
                socket.end()
                console.error(err)
            })
        })
    }

    #connectAll() {
        this.pool.forEach((connection) => {
            const {socket, options} = connection
            socket.connect(options)
        })
    }

    #disconnectAll() {
        this.pool.forEach((connection) => {
            connection.socket.end()
            clearInterval(connection.id)
        })
    }

    run() {
        if (this.configInfos !== null) {
            this.#setupPool()
            this.#setupConnection()
            this.#connectAll()
        }
    }

    reset() {
        this.#disconnectAll()
        this.#setupPool()
        this.#setupConnection()
        this.#connectAll()
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
