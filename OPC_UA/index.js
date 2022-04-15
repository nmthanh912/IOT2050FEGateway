const express = require('express')
const cors = require('cors')
const port = 4004
const app = express()

const redis = require('./redis/redisClient')
redis.pubConnection()

const DeviceConnection = require('./controllers/opcuaClient')
const pool = new DeviceConnection()

app.use(cors({origin: true}))

app.get('/poweron', async function (req, res) {
    try {
        await pool.poweron(req.query.deviceID)
        res.json({msg: 'oke'})
    } catch (err) {
        res.status(500).json({
            msg: err.message
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
        serviceName: 'OPC_UA',
        level: 'info',
        errMsg: `Server OPC_UA is listening on port ${port}!`,
    })
    console.log(`Server OPC_UA is listening on port ${port}!`)
})
