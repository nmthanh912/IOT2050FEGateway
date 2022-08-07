require('dotenv').config()
const Redis = require('ioredis')

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: 6379,
    maxRetriesPerRequest: null,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000)
        return delay
    },
    reconnectOnError() {
        return true
    }
})

redis.on('connect', () => {
    console.log('Server container connected to Redis Broker successfully!')
})

redis.on('error', (err) => {
    console.log('Could not connect to Redis Broker!' + err.toString())
})

module.exports = {
    pub2Redis: (channel, obj) => {
        const data = (typeof obj === "object" && obj != null) ?
            JSON.stringify(obj) : obj
        redis.publish(channel, data)
    },
    pubDisconnect: () => redis.disconnect()
}
