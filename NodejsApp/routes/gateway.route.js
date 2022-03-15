var express = require('express')
var router = express.Router()
var GatewayController = require('../controllers/gateway.controller')

router.post('/new', GatewayController.create)
router.get('/', GatewayController.get)
router.get('/devices', GatewayController.getSubcribedDevices)

module.exports = router
