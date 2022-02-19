var express = require('express')
var router = express.Router()
var controller = require('../../controllers/protocol/protocol.controller')

router.get('/', controller.getProtocol)
router.post('/', controller.postProtocol)
router.put('/:name', controller.editProtocol)
router.delete('/:name', controller.deleteProtocol)

module.exports = router
