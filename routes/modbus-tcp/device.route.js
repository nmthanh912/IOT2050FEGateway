var express = require('express')
var router = express.Router()

var controller = require('../../controllers/modbus-tcp/device.controller')

router.get('/', controller.list)
router.get('/add', controller.getAdd)
router.post('/add', controller.postAdd)

router.get('/edit/:id', controller.getEdit)
router.post('/edit/:id', controller.postEdit)

router.get('/delete/:id', controller.getDelete)

module.exports = router
