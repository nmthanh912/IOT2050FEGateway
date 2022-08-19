const express = require('express')
const router = express.Router()
const gatewayController = require('../controllers/gateway.controller')

router.post('/', gatewayController.create)
router.get('/', gatewayController.get)
router.put('/', gatewayController.update)
router.delete('/', gatewayController.delete)
router.get('/subscribes', gatewayController.getSubcribedDevices)
router.post('/subscribes', gatewayController.addSubscribedDevices)
router.delete('/subscribes', gatewayController.removeSubscribedDevice)
router.put('/subscribes/config', gatewayController.updateSubcribedDeviceConfig)
router.get('/subscribes/config', gatewayController.getSubcribedDeviceConfig)

module.exports = router
