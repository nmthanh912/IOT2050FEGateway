require('dotenv').config()
const Redis = require('ioredis')
const createServiceLogger = require('./loggerConstructor')

const loggerSubscriber = new Redis({
    host: process.env.REDIS_HOST,
    port: 6379,
    maxRetriesPerRequest: null,
    retryStrategy(times) {
        return Math.min(times * 50, 2000)
    },
    reconnectOnError() {
        return true
    },
})

const loggerList = []
const serviceNameList = ['Server', 'ModbusTCP', 'ModbusRTU', 'OPC_UA', 'MQTTClient']
let serviceLogger
serviceNameList.forEach((service) => {
    serviceLogger = createServiceLogger(service)
    loggerList.push({ serviceName: service, serviceLogger, })
})

loggerSubscriber.subscribe('log', (err, count) => {
    if (err) process.exit(1)
    console.log(`Subcribed successfully to ${count} ${count > 1 ? 'channels' : 'channel'}`)
})

let msg, service
loggerSubscriber.on('message', (channel, errMsg) => {
    msg = JSON.parse(errMsg)
    service = loggerList.find((service) => service.serviceName === msg.serviceName)
    if (typeof service !== 'undefined') service.serviceLogger.log(msg.level, msg.errMsg)
})
