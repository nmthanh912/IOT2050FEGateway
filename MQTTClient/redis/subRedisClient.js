require('dotenv').config()
const Redis = require('ioredis')
const fs = require('fs')

const pubRedis = require('../redis/pubRedisClient')
const removeAccents = require('../utils/removeAccents')
const JSON_PATH = process.env.CUSTOM_JSON_PATH

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
        this.redis = null
    }

    sub2Redis(mqtt, listDeviceSub, pubOption) {
        this.#subConnection()
        listDeviceSub.forEach((device) => {
            this.redis.subscribe(`data/${removeAccents(device.deviceName)}`, (err, count) => {
                if (err) {
                    pubRedis.pub2Redis('log', { serviceName: 'MQTTClient', level: 'error', errMsg: err })
                    console.log('Subscribe to topic has error!')
                }
            })
        })

        let dataList, dataOfTagSub, topic, device, deviceName, listTagSub, customJSON, hasBeenRead, jsonStr
        let obj, objDataStr, executeStr, getCustomJson

        this.redis.on('message', (channel, message) => {
            dataList = JSON.parse(message)
            topic = channel.replace('data', '/iot2050fe')
            deviceName = channel.slice(5)

            device = listDeviceSub.find(device => device.deviceNameModified === deviceName)
            listTagSub = device.listTagSub
            if (device.onCustomMode) {
                fs.readFile(`${JSON_PATH}/${device.mqttID}_${device.deviceID}.json`, 'utf-8', (err, content) => {
                    customJSON = content
                    hasBeenRead = false
                    jsonStr = ''
                    obj = {}

                    dataList.forEach((data) => {
                        obj[removeAccents(data.name)] = data
                    })
                    objDataStr = `const obj = ${JSON.stringify(obj)}\n`
                    if (!hasBeenRead) {
                        hasBeenRead = true

                        Object.keys(obj).forEach((key) => {
                            jsonStr += `const ${key} = obj.${key}\n`
                        })
                        jsonStr += `const data = ${customJSON}\n` + 'return data'
                    }
                    executeStr = objDataStr + jsonStr

                    try {
                        getCustomJson = new Function(executeStr)
                        mqtt.publish(`${topic}`, JSON.stringify(getCustomJson(-1)), pubOption)

                    } catch (err) {
                        pubRedis.pub2Redis('log', { serviceName: 'MQTTClient', level: 'error', errMsg: err })
                        console.log(err.message)
                    }
                })
            } else {
                if (listTagSub.length !== 0) {
                    dataOfTagSub = dataList.filter(data => listTagSub.includes(data.name))
                    /** send all tag's data of a device */
                    // mqtt.publish(topic, JSON.stringify(dataOfTagSub), pubOption)
                    /** send data of each tag */
                    dataOfTagSub.forEach(data => mqtt.publish(`${topic}/${removeAccents(data.name)}`, JSON.stringify(data), pubOption))
                }
            }
        })
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
