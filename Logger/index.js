require('dotenv').config()
const Redis = require('ioredis')
const createServiceLogger = require('./loggerConstructor')

const loggerSubscriber = new Redis({
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
})

const loggerList = []
const serviceNameList = ['Server', 'ModbusTCP', 'ModbusRTU', 'OPC_UA', 'MQTTClient']
serviceNameList.forEach((service) => {
    const serviceLogger = createServiceLogger(service)
    loggerList.push({
        serviceName: service,
        serviceLogger,
    })
})

loggerSubscriber.subscribe('log', (err, count) => {
    if (err) {
        process.exit(1)
    }
    console.log(`Subcribed successfully to ${count} ${count > 1 ? 'channels' : 'channel'}`)
})

loggerSubscriber.on('message', (channel, errMsg) => {
    const msg = JSON.parse(errMsg)
    const service = loggerList.find((service) => service.serviceName === msg.serviceName)
    if (service !== undefined) {
        service.serviceLogger.log(msg.level, msg.errMsg)
    }
})
