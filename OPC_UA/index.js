const express = require('express')
const cors = require('cors')
const port = 4004
const app = express()

const DeviceConnection = require('./controllers/opcuaClient')
const pool = new DeviceConnection()
pool.poweron('003385db')

// setTimeout(() => pool.poweron('003385dc'), 7000)

// setTimeout(() => pool.shutdown('003385dc'), 15000)

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
