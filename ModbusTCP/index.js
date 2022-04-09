const express = require('express')
const cors = require('cors')
const port = 4001
const app = express()

const DeviceConnectionPool = require('./controllers/modbusTCPClient')
const pool = new DeviceConnectionPool()

pool.poweron('46503bb3')
setTimeout(() => pool.poweron('ce8a1c9c'), 1000)
setTimeout(() => pool.poweron('33dfc393'), 2000)

setTimeout(() => {
    console.log(pool.deviceState())
}, 10000)


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
    console.log(`Server ModbusTCP is listening on port ${port}!`)
})
