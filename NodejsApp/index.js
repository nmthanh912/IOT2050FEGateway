const express = require('express')
const app = express()
const route = require('./routes/index')
const redis = require('./redis/redisClient')

const PORT = 4000

redis.pubConnection()

const cors = require('cors')
app.use(cors({ origin: true }))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

route(app)

app.listen(PORT, function () {
    redis.pub2Redis('log', { serviceName: 'Server', level: 'info', errMsg: `Server listening on port ${PORT}!` })
    console.log(`Server is  listening on port ${PORT}!`)
})
