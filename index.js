require('dotenv').config()
require('express-group-routes')

// Protocol here
require('./protocols/opcua_client')
//require('./protocols/modbus_rtu')
require('./protocols/modbus_tcp')

const normalizePort = require('normalize-port')
var bodyParser = require('body-parser')
const express = require('express')
const port = normalizePort(process.env.PORT || 3100)
const app = express()

app.use(express.static('public'))
var favicon = require('serve-favicon')
var path = require('path')

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

// Download csv file
const fs = require('fs')
app.get('/download-modbustcp', (req, res) => {
    return res.download('./csv/modbusTCPValue.csv')
    // return res.download('./csv/modbusRTUValue.csv', () => {
    //     fs.unlinkSync('./csv/modbusRTUValue.csv')
    // })
})
app.get('/download-modbusrtu', (req, res) => {
    return res.download('./csv/modbusRTUValue.csv')
})
app.get('/download-opcua', (req, res) => {
    return res.download('./csv/opcuaValue.csv')
})

app.use((req, res, next) => {
    res.locals.user = ''
    next()
})
//==================
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})) // for parsing application/x-www-form-urlencoded

const cookieParser = require('cookie-parser')
app.use(cookieParser()) // use to read format cookie

var engine = require('ejs-locals')
app.engine('ejs', engine)
app.set('view engine', 'ejs')

app.set('views', './views')

// ------------Khai báo Router -------------------------------
var homeRouter = require('./routes/home/index.route')
// Report Rputer----------------------------------------------
var reportRouter = require('./routes/report/report.route')
// Modbus TCP/IP Router---------------------------------------
var deviceRouter = require('./routes/modbus-tcp/device.route')
var tagRouter = require('./routes/modbus-tcp/tag.route')
// Modbus RTU Router-----------------------------------------
var deviceRTURouter = require('./routes/modbus-rtu/device.route')
var tagRTURouter = require('./routes/modbus-rtu/tag.route')
// OPCUA Client Router---------------------------------------
var deviceOpcRouter = require('./routes/opcua-client/device.route')
var tagOpcRouter = require('./routes/opcua-client/tag.route')
// MQTT Broker Router----------------------------------------
var brokerRouter = require('./routes/mqtt/broker.route')

app.use('/', homeRouter)
app.use('/home', homeRouter)

app.use('/report', reportRouter)

app.group('/modbus-tcp', (router) => {
    router.use('/device', deviceRouter)
    router.use('/tag', tagRouter)
})

app.group('/modbus-rtu', (router) => {
    router.use('/device', deviceRTURouter)
    router.use('/tag', tagRTURouter)
})

app.group('/opcua-client', (router) => {
    router.use('/device', deviceOpcRouter)
    router.use('/tag', tagOpcRouter)
})

app.group('/mqtt', (router) => {
    router.use('/broker', brokerRouter)
})

//-------------------------------------------------------------------
app.listen(port, function () {
    console.log(`Server listening on port ${port}!`)
})

//--------------------Socket io---------------------------------------
var server = require('http').createServer(app)
var io = require('socket.io')(server)

let serverPort = 4001
server.listen(serverPort, function () {
    console.log('Socket io listening on *: ' + serverPort)
})

io.on('connection', function (socket) {
    console.log('A user connected ' + socket.id)
    io.emit('data', 'Hello user ' + socket.id)

    socket.on('modbus_tcp', function (msg) {
        io.emit('modbus_tcp', msg)
    })

    socket.on('modbus_rtu', function (msg) {
        io.emit('modbus_rtu', msg)
    })

    socket.on('opcua_client', function (msg) {
        io.emit('opcua_client', msg)
    })
})
