require('dotenv').config()
const Redis = require('ioredis')
const fs = require('fs')

const pubRedis = require('../redis/pubRedisClient')
const removeAccents = require('../utils/removeAccents')
const JSON_PATH = process.env.MODE === 'development' ? '../customJSON' : './customJSON'

class RedisClient {
    constructor() {
        this.options = {
            host: process.env.MODE === 'development' ? '127.0.0.1' : 'redis',
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

    sub2Redis(mqtt, listSub, pubOption) {
        this.#subConnection()
        listSub.forEach((item) => {
            const deviceName = removeAccents(item.deviceName)
            this.redis.subscribe(`data/${deviceName}`, (err, count) => {
                if (err) {
                    pubRedis.pub2Redis('log', {serviceName: 'MQTTClient', level: 'error', errMsg: err})
                    console.log('Subscribe to topic has errror!')
                }
            })
            if (item.onCustomMode) {
                fs.readFile(`${JSON_PATH}/${item.mqttID}_${item.deviceID}.json`, 'utf-8', (err, content) => {
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
                        mqtt.publish(`/iot2050/${deviceName}`, JSON.stringify(sendValue), pubOption)
                    })
                })
            } else {
                this.redis.on('message', (channel, message) => {
                    const dataList = JSON.parse(message)
                    item.tagNameList.forEach((tagName) => {
                        this.#normalPublish(mqtt, deviceName, tagName, dataList, pubOption)
                    })
                })
            }
        })
    }

    #normalPublish(mqtt, deviceName, tagName, dataList, pubOption) {
        const tagData = dataList.find((data) => data.name === tagName)
        if (tagData !== undefined) {
            const topicPub = `data/${deviceName}/` + removeAccents(tagData.name)
            mqtt.publish(topicPub, JSON.stringify(tagData), pubOption)
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
