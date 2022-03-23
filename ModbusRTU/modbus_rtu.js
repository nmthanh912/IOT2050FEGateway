const modbusRTU = require('modbus-serial')

const getConfig = require('./getConfig')

// open connection to serial port
const client = new modbusRTU()

class DataConnectionPool {
    constructor(configInfos = null) {
        this.configInfos = configInfos
    }

    setConfigInfos(configInfos) {
        this.configInfos = configInfos
    }

    getData() {
        this.id = setInterval(async () => {
            try {
                for (let config of this.configInfos) {
                    await this.setupConnection(config)
                }
            } catch (err) {
                console.log(err)
            }
        }, 3000)
    }

    async setupConnection(config) {
        try {
            await client.setID(config.slaveid)

            for (let tag of config.tagInfo) {
                await client
                    .readHoldingRegisters(parseInt(tag.address), 2)
                    .then((data) => {
                        let buf = Buffer.allocUnsafe(4)

                        buf.writeUInt16BE(data.data[0], 0)
                        buf.writeUInt16BE(data.data[1], 2)

                        let value = parseFloat(buf.readFloatBE().toFixed(2))
                        // console.log(tag.name, value)
                    })
                    .catch((err) => {
                        console.error(err)
                    })
            }
        } catch (err) {
            console.log(err)
        }
    }

    disconnectAll() {
        clearInterval(this.id)
    }

    run() {
        if (this.configInfos !== null) {
            this.getData()
        }
    }

    reset() {
        this.disconnectAll()
        this.getData()
    }
}

class Process {
    #connectionPool
    constructor() {
        this.#connectionPool = new DataConnectionPool()
    }

    async run(reset = false) {
        try {
            const configInfos = await getConfig('MODBUSRTU')

            console.log(configInfos)

            if (configInfos.length > 0) {
                this.#connectionPool.setConfigInfos(configInfos)

                client
                    .connectRTUBuffered(configInfos[0].com_port_num, {
                        baudRate: configInfos[0].baudrate,
                        dataBits: configInfos[0].databits,
                        stopBits: configInfos[0].stopbits,
                        parity: configInfos[0].parity,
                    })
                    .catch((err) => {
                        console.log(err)
                    })
                client.setTimeout(500)

                !reset ? this.#connectionPool.run() : this.#connectionPool.reset()
            }
        } catch (err) {
            console.log(err)
        }
    }
}

module.exports = Process
