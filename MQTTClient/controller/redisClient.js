const Redis = require('ioredis')
const removeAccents = require('../utils/removeAccents')

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
        this.subRedis = null
    }

    sub2Redis(mqtt, listSub) {
        this.#subConnection()
        listSub.forEach((item) => {
            const deviceName = removeAccents(item.deviceName)
            this.subRedis.subscribe(`data/${deviceName}`, (err, count) => {
                if (err) {
                    console.log('Subscribe to topic has errror!')
                }
            })

            

            this.subRedis.on('message', (channel, message) => {
                const dataList = JSON.parse(message)
                // console.log(dataList)
                item.tagNameList.forEach((tagName) => {
                    const tagData = dataList.find((data) => data.name === tagName)
                    if (tagData !== undefined) {
                        const topicPub = `data/${deviceName}/` + removeAccents(tagData.name)
                        mqtt.publish(topicPub, JSON.stringify(tagData))
                        console.log(tagData)
                    }
                })
            })
        })
    }

    #subConnection() {
        const options = this.options
        this.subRedis = new Redis(options)

        this.subRedis.on('connect', () => {
            console.log('MQTT Client container connected to Redis Broker successfully!')
        })

        this.subRedis.on('error', (err) => {
            console.log('Could not connect to Redis Broker!' + err.toString())
        })
    }

    subDisconnect() {
        this.subRedis.disconnect()
    }
}

module.exports = new RedisClient()
