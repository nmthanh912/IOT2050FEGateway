// Routes
const deviceRouter = require('./device/device.route')

function route(app) {
    app.use('/devices', deviceRouter)
}

module.exports = route
