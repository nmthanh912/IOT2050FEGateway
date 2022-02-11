var express = require('express')
var router = express.Router()
var controller = require('../../controllers/tag/tag.controller')

router.get('/', controller.getTag)
router.post('/', controller.postTag)
router.put('/:id', controller.editTag)
router.delete('/:id', controller.deleteTag)

module.exports = router
