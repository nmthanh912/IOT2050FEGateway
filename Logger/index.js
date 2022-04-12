const Redis = require('ioredis')
const createServiceLogger = require('./loggerConstructor')

const loggerSubscriber = new Redis()
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
