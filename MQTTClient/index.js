const express = require('express')
const port = 4005
const app = express()
const cors = require('cors')

const pubRedis = require('./redis/pubRedisClient')
pubRedis.pubConnection()

const MQTTConnectionPool = require('./controller/mqttClient')
const pool = new MQTTConnectionPool()

app.use(cors({origin: true}))

app.get('/poweron', async function (req, res) {
    try {
        let mqttID = req.query.mqttID
        await pool.poweron(mqttID)
        res.json({msg: 'OKE'})
    } catch (err) {
        res.status(500).json({msg: err.message})
    }
})

app.get('/shutdown', function (req, res) {
    let mqttID = req.query.mqttID
    pool.shutdown(mqttID)
    res.json({msg: 'OKE'})
})

app.get('/active-gateways', function (req, res) {
    let runningGateways = pool.getRunningGateways()
    res.json(runningGateways)
})

app.listen(port, function () {
    pubRedis.pub2Redis('log', {
        serviceName: 'MQTTClient',
        level: 'info',
        errMsg: `Server MQTT listening on port ${port}!`,
    })
    console.log(`Server MQTT listening on port ${port}!`)
})
