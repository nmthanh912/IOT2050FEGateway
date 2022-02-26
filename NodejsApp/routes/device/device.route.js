var express = require('express')
var router = express.Router()
var deviceController = require('../../controllers/device/device.controller')
var tagController = require('../../controllers/tag/tag.controller')

router.get('/', deviceController.getDevice)
router.post('/new', deviceController.postDevice)
router.put('/:id', deviceController.editDevice)
router.delete('/:id', deviceController.deleteDevice)

router.get('/:id/tags', tagController.getTag)

module.exports = router
