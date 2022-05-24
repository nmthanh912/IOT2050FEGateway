const express = require('express')
const cors = require('cors')
const port = 4002
const app = express()

const redis = require('./redis/redisClient')
redis.pubConnection()

const DeviceConnectionPool = require('./controller/modbusRTUClient')
const pool = new DeviceConnectionPool()

app.use(cors({origin: true}))

app.get('/poweron', async function (req, res) {
    try {
        await pool.poweron(req.query.deviceID)
        res.json({msg: 'oke'})
    } catch (err) {
        res.status(500).json({
            msg: err.message,
        })
    }
})

app.get('/shutdown', function (req, res) {
    pool.shutdown(req.query.deviceID)
    res.json({msg: 'oke'})
})

app.get('/active-list', function (req, res) {
    let runningDevices = pool.getRunningDevices()
    res.json(runningDevices)
})

app.listen(port, function () {
    redis.pub2Redis('log', {
        serviceName: 'ModbusRTU',
        level: 'info',
        errMsg: `Server ModbusRTU is listening on port ${port}!`,
    })
    console.log(`Server ModbusRTU is listening on port ${port}!`)
})
