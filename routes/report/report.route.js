var express = require('express')
var router = express.Router()
var controller = require('../../controllers/report/report.controller')

router.get('/', controller.list)

module.exports = router
