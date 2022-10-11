require('dotenv').config()
const Redis = require('ioredis')

class RedisClient {
    constructor() {
        this.options = {
            host: process.env.REDIS_HOST,
            port: 6379,
            maxRetriesPerRequest: null,
            retryStrategy(times) {
                return Math.min(times * 50, 2000)
            },
            reconnectOnError() {
                return true
            },
        }
        this.redisPub = null
    }

    pubConnection() {
        const options = this.options
        this.redisPub = new Redis(options)

        this.redisPub.on('connect', () => {
            console.log('ModbusRTU container connected to Redis Broker successfully!')
        })

        this.redisPub.on('error', (err) => {
            console.log('Could not connect to Redis Broker!' + err.toString())
        })
    }

    pub2Redis(channel, msg) {
        this.redisPub.publish(channel, JSON.stringify(msg))
    }

    pubDisconnect() {
        this.redisPub.disconnect()
    }
}

const redis = new RedisClient()
redis.pubConnection()

module.exports = redis
