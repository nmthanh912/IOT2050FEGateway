const Redis = require('ioredis')
const removeAccents = require('../utils/removeAccents')
const fs = require('fs')
// const util = require('util')
// const readFile = util.promisify(fs.readFile.bind(fs))

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
        this.redis = null
    }

    sub2Redis(mqtt, listSub) {
        this.#subConnection()
        listSub.forEach((item) => {
            const deviceName = removeAccents(item.deviceName)
            this.redis.subscribe(`data/${deviceName}`, (err, count) => {
                if (err) {
                    console.log('Subscribe to topic has errror!')
                }
            })
            if (item.onCustomMode) {
                fs.readFile(`../customJSON/${item.mqttID}_${item.deviceID}.json`, 'utf-8', (err, content) => {
                    let customJSON = content
                    let hasBeenRead = false
                    const obj = {}

                    this.redis.on('message', (channel, message) => {
                        const dataList = JSON.parse(message)
                        if (!hasBeenRead) {
                            dataList.forEach((data) => {
                                obj[removeAccents(data.name)] = data
                            })
                            const objKeys = Object.keys(obj)
                            hasBeenRead = true
                            objKeys.forEach((key) => {
                                customJSON = customJSON.replaceAll(key, 'obj.' + key)
                            })
                        }
                        let sendValue
                        eval(`
                            sendValue = ${customJSON}
                        `)
                        mqtt.publish(`/iot2050/${deviceName}`, JSON.stringify(sendValue))
                    })
                })
            } else {
                this.redis.on('message', (channel, message) => {
                    const dataList = JSON.parse(message)
                    item.tagNameList.forEach((tagName) => {
                        this.#normalPublish(mqtt, deviceName, tagName, dataList)
                    })
                })
            }
        })
    }

    #normalPublish(mqtt, deviceName, tagName, dataList) {
        const tagData = dataList.find((data) => data.name === tagName)
        if (tagData !== undefined) {
            const topicPub = `data/${deviceName}/` + removeAccents(tagData.name)
            mqtt.publish(topicPub, JSON.stringify(tagData))
            console.log(tagData)
        }
    }

    #subConnection() {
        const options = this.options
        this.redis = new Redis(options)

        this.redis.on('connect', () => {
            console.log('MQTT Client container connected to Redis Broker successfully!')
        })

        this.redis.on('error', (err) => {
            console.log('Could not connect to Redis Broker!' + err.toString())
        })
    }

    subDisconnect() {
        this.redis.disconnect()
    }
}

module.exports = new RedisClient()
