require('dotenv').config()
require('express-group-routes')

// require('./subscribe.js')
// Protocol here
// require('./protocols/opcua_client')
// require('./protocols/modbus/modbus_rtu')
// require('./protocols/modbus/modbus_tcp')

const bodyParser = require('body-parser')
const express = require('express')
const port = 4000
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

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})) // for parsing application/x-www-form-urlencoded

// ------------Khai báo Router -------------------------------
const route = require('./routes/index')
route(app)

//-------------------------------------------------------------------
app.listen(port, function () {
    console.log(`Server listening on port ${port}!`)
})
