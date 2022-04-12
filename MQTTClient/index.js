const express = require('express')
const port = 4005
const app = express()

const pubRedis = require('./redis/pubRedisClient')
pubRedis.pubConnection()

const MQTTConnectionPool = require('./controller/mqttClient')
const pool = new MQTTConnectionPool()

app.listen(port, function () {
    pubRedis.pub2Redis('log', {
        serviceName: 'MQTTClient',
        level: 'info',
        errMsg: `Server MQTT listening on port ${port}!`,
    })
    console.log(`Server MQTT listening on port ${port}!`)
})
