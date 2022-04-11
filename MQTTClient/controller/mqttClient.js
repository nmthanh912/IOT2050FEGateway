const mqttClient = require('mqtt')

const getConfig = require('./configInfo')
const subRedis = require('../redis/subRedisClient')
const pubRedis = require('../redis/pubRedisClient')

class MQTTConnection {
    constructor(mqttConfig, listSub) {
        this.mqttID = mqttConfig.ID
        this.ip = mqttConfig.IP
        this.port = mqttConfig.port
        this.clientOptions = {
            username: mqttConfig.username,
            password: mqttConfig.password,
            keepalive: 60,
            reconnectPeriod: 1000,
        }
        this.pubOption = {
            QoS: mqttConfig.QoS,
        }
        this.listSub = listSub
    }

    #connection() {
        this.mqtt = mqttClient.connect(`mqtt://${this.ip}:${this.port}`, this.clientOptions)

        this.mqtt
            .on('reconnect', () => {
                pubRedis.pub2Redis('log', {
                    serviceName: 'MQTTClient',
                    level: 'info',
                    errMsg: 'MQTT Client try to reconnect to Broker!',
                })
                console.log('MQTT Client try to reconnect to Broker!')
            })
            .on('offline', () => {
                pubRedis.pub2Redis('log', {
                    serviceName: 'MQTTClient',
                    level: 'info',
                    errMsg: 'MQTT Client went offline!',
                })
                console.log('MQTT Client went offline!')
            })
            .on('error', (err) => {
                pubRedis.pub2Redis('log', {serviceName: 'MQTTClient', level: 'error', errMsg: err})
                console.log('Client cannot connect to Broker!', err)
            })
            .on('connect', () => {
                pubRedis.pub2Redis('log', {serviceName: 'MQTTClient', level: 'info', errMsg: 'Connected!'})
                subRedis.sub2Redis(this.mqtt, this.listSub, this.pubOption)
            })
    }

    poweron() {
        this.#connection()
    }

    shutdown() {
        if (subRedis.redis !== null) {
            subRedis.subDisconnect()
        }
        this.mqtt.end()
    }
}

class MQTTConnectionPool {
    #pool
    constructor() {
        this.#pool = []
    }

    async poweron(mqttID) {
        try {
            const configInfo = await getConfig(mqttID)
            if (configInfo.length > 0) {
                const {mqttConfig, listSub} = configInfo[0]
                const connection = new MQTTConnection(mqttConfig[0], listSub)
                connection.poweron()
                this.#pool.push(connection)
            }
        } catch (err) {
            pubRedis.pub2Redis('log', {serviceName: 'MQTTClient', level: 'error', errMsg: err})
            console.log('Get config info error!', err)
        }
    }

    shutdown(mqttID) {
        const connection = this.#pool.find((conn) => conn.mqttID === mqttID)
        if (connection !== undefined) {
            connection.shutdown()
            this.#pool.slice(this.#pool.indexOf(connection), 1)
        }
    }

    mqttState() {
        const mqttID = []
        this.#pool.forEach((conn) => {
            mqttID.push(conn.mqttID)
        })
        return mqttID
    }
}

module.exports = MQTTConnectionPool
