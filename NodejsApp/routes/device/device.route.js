var express = require('express')
var router = express.Router()
var deviceController = require('../../controllers/device/device.controller')
var tagController = require('../../controllers/tag/tag.controller')

router.get('/', deviceController.getAllDevice)
router.post('/new', deviceController.postDevice)
router.get('/:id', deviceController.getDevice)
router.get('/:id/config', deviceController.getDeviceConfig)
router.put('/:id/edit', deviceController.editDeviceInfo)
router.delete('/:id', deviceController.deleteDeviceInfo)

router.get('/:id/tags', tagController.getTag)

module.exports = router
