var express = require('express')
var router = express.Router()
var GatewayController = require('../controllers/gateway.controller')

router.post('/new', GatewayController.create)
router.get('/', GatewayController.get)
router.get('/devices', GatewayController.getSubcribedDevices)
router.put('/update', GatewayController.update)
router.delete('/delete', GatewayController.delete)

router.get('/devices/config', GatewayController.getSubcribedDeviceConfig)
router.put('/:gid/:did', GatewayController.updateSubcribedDeviceConfig)
router.post('/sub', GatewayController.addSubscribeDevices)
router.delete('/unsub', GatewayController.removeSubscribeDevice)

module.exports = router
