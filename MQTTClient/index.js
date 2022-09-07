require('dotenv').config()
const express = require('express')
const PORT = 4005
const app = express()
const cors = require('cors')

const fs = require('fs')

const pubRedis = require('./redis/pubRedisClient')
pubRedis.pubConnection()

const MQTTConnectionPool = require('./controller/mqttClient')
const pool = new MQTTConnectionPool()

const mqttOnPath = process.env.DEVICE_ON_PATH

app.use(cors({ origin: true }))

/** turn on mqtt after container is off */
let mqttIDList = fs.readFileSync(`${mqttOnPath}/mqtt.txt`, 'utf-8')
mqttIDList = mqttIDList.split(',')
mqttIDList.pop()

const promises = mqttIDList.map(async (mqttID) => {
    if (mqttID) return await pool.poweron(mqttID)
})

Promise.all(promises)
    .catch(err => {
        redis.pub2Redis('log', { serviceName: 'MQTTClient', level: 'err', errMsg: err, })
        console.log(err)
    })

app.get('/poweron', async function (req, res) {
    try {
        await pool.poweron(req.query.mqttID)
        /** turn on mqtt, append new mqttID */
        fs.appendFile(`${mqttOnPath}/mqtt.txt`, `${req.query.mqttID},`, 'utf8', (err) => {
            if (err) {
                redis.pub2Redis('log', { serviceName: 'MQTTClient', level: 'err', errMsg: err, })
                console.log(err)
            }
        })
        res.json({ msg: 'oke' })
    } catch (err) {
        res.status(500).json({
            msg: err.message
        })
    }
})

app.get('/shutdown', function (req, res) {
    pool.shutdown(req.query.mqttID)
    /** turn off mqtt, replace mqttID to empty string */
    fs.readFile(`${mqttOnPath}/mqtt.txt`, 'utf8', (err, data) => {
        if (err) {
            redis.pub2Redis('log', { serviceName: 'MQTTClient', level: 'err', errMsg: err, })
            console.log(err)
        } else {
            fs.writeFile(`${mqttOnPath}/mqtt.txt`, data.replace(`${req.query.mqttID},`, ''), 'utf-8', (err) => {
                if (err) {
                    redis.pub2Redis('log', { serviceName: 'MQTTClient', level: 'err', errMsg: err, })
                    console.log(err)
                }
            })
        }
    })
    res.json({ msg: 'oke' })
})

app.get('/active-gateways', function (req, res) {
    let runningGateways = pool.getRunningGateways()
    res.json(runningGateways)
})

app.listen(PORT, function () {
    pubRedis.pub2Redis('log', { serviceName: 'MQTTClient', level: 'info', errMsg: `Server MQTT listening on port ${PORT}!`, })
    console.log(`Server MQTT listening on port ${PORT}!`)
})
