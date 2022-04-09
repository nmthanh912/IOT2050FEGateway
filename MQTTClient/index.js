const express = require('express')
const port = 4005
const app = express()

const MQTTConnectionPool = require('./controller/mqttClient')
const pool = new MQTTConnectionPool()
pool.poweron('7f958a74')


app.listen(port, function () {
    console.log(`Server listening on port ${port}!`)
})
