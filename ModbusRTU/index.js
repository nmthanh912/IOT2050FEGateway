const express = require('express')
const cors = require('cors')
const port = 4002
const app = express()

const redis = require('./redis/redisClient')

const DeviceConnectionPool = require('./controller/modbusRTUClient')
const pool = new DeviceConnectionPool()

app.use(cors())

app.get('/poweron', function (req, res) {
    pool.poweron(req.query.deviceID)
    res.json({msg: 'oke'})
})

app.get('/shutdown', function (req, res) {
    pool.shutdown(req.query.deviceID)
    res.json({msg: 'oke'})
})

app.listen(port, function () {
    redis.pub2Redis('log', {
        serviceName: 'ModbusRTU',
        level: 'info',
        errMsg: `Server ModbusRTU listening on port ${port}!`,
    })
    console.log(`Server ModbusRTU listening on port ${port}!`)
})
