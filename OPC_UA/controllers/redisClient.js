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
        this.redisSub = null
    }

    pub2Redis(channel, msg) {
        this.redisPub.publish(channel, JSON.stringify(msg))
    }

    subRedis(pattern) {
        this.redisClient.psubscribe(pattern, (err, count) => {})
        this.redisClient.on('pmessage', (pattern, channel, message) => {
            console.log('pattern', pattern)
            console.log('channel', channel)
            console.log('message', message)
        })
    }

    subConnection() {
        const options = this.options
        this.redisSub = new Redis(options)

        this.redisSub.on('connect', () => {
            console.log('ModbusTCP container connected to Redis Broker successfully!')
        })

        this.redisSub.on('error', (err) => {
            console.log('Could not connect to Redis Broker!' + err.toString())
        })
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

    subDisconnect() {
        this.redisSub.disconnect()
    }

    pubDisconnect() {
        this.redisPub.disconnect()
    }
}

module.exports = new RedisClient()
