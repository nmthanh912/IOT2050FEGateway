require('dotenv').config()
require('express-group-routes')

// Protocol here
// require('./protocols/opcua_client')
// require('./protocols/modbus_rtu')
// require('./protocols/modbus_tcp')

const normalizePort = require('normalize-port')
const bodyParser = require('body-parser')
const express = require('express')
const port = normalizePort(process.env.PORT || 3100)
const app = express()

app.use(express.static('public'))
var favicon = require('serve-favicon')
var path = require('path')

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

const cors = require('cors')
app.use(cors({origin: true}))

app.use((req, res, next) => {
    res.locals.user = ''
    next()
})
//==================
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})) // for parsing application/x-www-form-urlencoded

const cookieParser = require('cookie-parser')
app.use(cookieParser()) // use to read format cookie

// ------------Khai báo Router -------------------------------
var deviceRouter = require('./routes/device/device.route')
var tagRouter = require('./routes/tag/tag.route')
var protocolRouter = require('./routes/protocol/protocol.route')
var configRouter = require('./routes/config/config.route')
var mqttRouter = require('./routes/mqtt/mqtt.route')

app.use('/device', deviceRouter)
app.use('/tag', tagRouter)
app.use('/protocol', protocolRouter)
app.use('/config', configRouter)
// app.use('/mqtt', mqttRouter)

//-------------------------------------------------------------------
app.listen(port, function () {
    console.log(`Server listening on port ${port}!`)
})
