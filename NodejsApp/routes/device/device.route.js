var express = require('express')
var router = express.Router()
var controller = require('../../controllers/device/device.controller')

router.post('/', controller.postDevice)
router.put('/:id', controller.editDevice)
router.delete('/:id', controller.deleteDevice)

module.exports = router
