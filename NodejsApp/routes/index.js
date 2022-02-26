// Routes
const deviceRouter = require('./device/device.route')
const protocolRouter = require('./protocol/protocol.route')
const configRouter = require('./config/config.route')
const mqttRouter = require('./mqtt/mqtt.route')

// Controller
const protocolController = require('../controllers/protocol/protocol.controller')

function route(app) {
    app.use('/devices', deviceRouter)

    app.use('/protocols', protocolController.getProtocol)
    app.use('/protocol', protocolRouter)

    app.use('/config', configRouter)
}

module.exports = route
