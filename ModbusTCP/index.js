require('dotenv').config()
const fs = require('fs')

const express = require('express')
const cors = require('cors')
const port = 4001
const app = express()

const redis = require('./redis/redisClient')

const DeviceConnectionPool = require('./controllers/modbusTCPClient')
const pool = new DeviceConnectionPool()

const deviceOnPath = process.env.DEVICE_ON_PATH

app.use(cors({ origin: true }))

/** turn on device after container is off */
let deviceIdList = fs.readFileSync(`${deviceOnPath}/modbusTCP.txt`, 'utf-8')
deviceIdList = deviceIdList.split(',')
deviceIdList.pop()

const promises = deviceIdList.map(async (deviceId) => {
    if (deviceId) return await pool.poweron(deviceId)
})

Promise.all(promises)
    .catch(err => {
        redis.pub2Redis('log', { serviceName: 'ModbusTCP', level: 'err', errMsg: err, })
        console.log(err)
    })

app.get('/poweron', async function (req, res) {
    try {
        await pool.poweron(req.query.deviceID)
        /** turn on device, append new deviceId */
        fs.appendFile(`${deviceOnPath}/modbusTCP.txt`, `${req.query.deviceID},`, 'utf8', (err) => {
            if (err) {
                redis.pub2Redis('log', { serviceName: 'ModbusTCP', level: 'err', errMsg: err, })
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
    pool.shutdown(req.query.deviceID)
    /** turn off device, replace deviceId to empty string */
    fs.readFile(`${deviceOnPath}/modbusTCP.txt`, 'utf8', (err, data) => {
        if (err) {
            redis.pub2Redis('log', { serviceName: 'ModbusTCP', level: 'err', errMsg: err, })
            console.log(err)
        } else {
            fs.writeFile(`${deviceOnPath}/modbusTCP.txt`, data.replace(`${req.query.deviceID},`, ''), 'utf-8', (err) => {
                if (err) {
                    redis.pub2Redis('log', { serviceName: 'ModbusTCP', level: 'err', errMsg: err, })
                    console.log(err)
                }
            })
        }
    })
    res.json({ msg: 'oke' })
})

app.get('/active-list', function (req, res) {
    let runningDevices = pool.getRunningDevices()
    res.json(runningDevices)
})

app.listen(port, function () {
    redis.pub2Redis('log', { serviceName: 'ModbusTCP', level: 'info', errMsg: `Server ModbusTCP is listening on port ${port}!`, })
    console.log(`Server ModbusTCP is listening on port ${port}!`)
})
