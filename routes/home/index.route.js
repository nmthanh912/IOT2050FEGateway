var express = require('express')
var router = express.Router()
var controller = require('../../controllers/home/home.controller')

router.get('/', controller.list)

module.exports = router
