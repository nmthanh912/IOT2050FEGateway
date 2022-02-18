// Routes
const deviceRouter = require('./device/device.route')
const tagRouter = require('./tag/tag.route')
const protocolRouter = require('./protocol/protocol.route')
const configRouter = require('./config/config.route')
const mqttRouter = require('./mqtt/mqtt.route')

// Controller
const deviceController = require('../controllers/device/device.controller')
const tagController = require('../controllers/tag/tag.controller')
const protocolController = require('../controllers/protocol/protocol.controller')

function route(app) {
    app.use('/devices', deviceController.getDevice)
    app.use('/device', deviceRouter)
    app.use('/tags', tagController.getTag)
    app.use('/tag', tagRouter)
    app.use('/protocols', protocolController.getProtocol)
    app.use('/protocol', protocolRouter)

    app.use('/config', configRouter)
}

module.exports = route
