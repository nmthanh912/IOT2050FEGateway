var express = require('express')
var router = express.Router()
var Device = require('../controllers/device.controller')
var Tag = require('../controllers/tag.controller')

router.get('/', Device.getAll)
router.post('/new', Device.create)
router.get('/:id', Device.getById)
router.get('/:id/config', Device.getConfigById)
router.put('/:id/edit', Device.editInfo)
router.delete('/:id', Device.drop)

router.get('/:id/tags', Tag.getAll)
router.put('/:id/tags/edit', Tag.editAttribute)
router.delete('/:id/tag', Tag.deleteTag)
router.post('/:id/tags/add', Tag.addTag)

module.exports = router
