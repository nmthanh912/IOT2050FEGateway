const express = require('express')
const port = 4005
const app = express()

const MQTTConnectionPool = require('./controller/mqttClient')
const pool = new MQTTConnectionPool()
pool.poweron('2ce17b4a')

setTimeout(() => pool.shutdown('2ce17b4a'), 16000)

app.listen(port, function () {
    console.log(`Server listening on port ${port}!`)
})
