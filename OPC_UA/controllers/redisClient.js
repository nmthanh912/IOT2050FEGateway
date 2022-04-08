const Redis = require('ioredis')

class RedisClient {
    constructor() {
        this.options = {
            host: '127.0.0.1',
            port: 6379,
            maxRetriesPerRequest: null,
            retryStrategy(times) {
                const delay = Math.min(times * 50, 2000)
                return delay
            },
            reconnectOnError() {
                return true
            },
        }
        this.redisPub = null
    }

    pub2Redis(channel, msg) {
        this.redisPub.publish(channel, JSON.stringify(msg))
    }

    pubConnection() {
        const options = this.options
        this.redisPub = new Redis(options)

        this.redisPub.on('connect', () => {
            console.log('ModbusTCP container connected to Redis Broker successfully!')
        })

        this.redisPub.on('error', (err) => {
            console.log('Could not connect to Redis Broker!' + err.toString())
        })
    }

    pubDisconnect() {
        this.redisPub.disconnect()
    }
}

module.exports = new RedisClient()
