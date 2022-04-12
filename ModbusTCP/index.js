const express = require('express')
const cors = require('cors')
const port = 4001
const app = express()

const redis = require('./redis/redisClient')
redis.pubConnection()

const DeviceConnectionPool = require('./controllers/modbusTCPClient')
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
        serviceName: 'ModbusTCP',
        level: 'info',
        errMsg: `Server ModbusTCP is listening on port ${port}!`,
    })
    console.log(`Server ModbusTCP is listening on port ${port}!`)
})
