const express = require('express')
const cors = require('cors')
const port = 4001
const app = express()

const DeviceConnectionPool = require('./modbusTCP')
const pool = new DeviceConnectionPool()

const Redis = require('ioredis')
const redis = new Redis()
// topic handle event
const POWERON = 'POWERON'
const SHUTDOWN = 'SHUTDOWN'
const RESTART = 'RESTART'

redis.subscribe(POWERON, SHUTDOWN, RESTART, (err) => {
    if (err) {
        console.error(err.message)
    } else {
        console.log('Subscribe successfully!')
    }
})

// redis.on('message', (channel, message) => {
//     if (channel === POWERON) {
//         const {deviceID, protocolName} = JSON.parse(message)
//         process.run(deviceID)
//     } else if (channel === SHUTDOWN) {
//         console.log(channel, JSON.parse(message))
//     } else if (channel === RESTART) {
//         console.log(channel, JSON.parse(message))
//     }
// })

// process.run('057aae80')

app.use(cors())

app.get('/poweron', function (req, res) {
    // console.log(req.query.deviceID)
    pool.poweron(req.query.deviceID)
    res.json({msg: 'okela'})
})

app.get('/shutdown', function (req, res) {
    // console.log(req.query.deviceID)
    pool.shutdown(req.query.deviceID)
    res.json({msg: 'okela'})
})

app.listen(port, function () {
    console.log(`Server ModbusTCP listening on port ${port}!`)
})
