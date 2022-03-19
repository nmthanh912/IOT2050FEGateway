// Routes
const deviceRouter = require('./device.route')
const gatewayRouter = require('./gateway.route')

function route(app) {
    app.use('/devices', deviceRouter)
    app.use('/gateways', gatewayRouter)
}

module.exports = route
