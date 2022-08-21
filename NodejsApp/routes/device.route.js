const express = require('express')
const { BAD_REQUEST_CODE } = require('../constants/error')
const router = express.Router()
const deviceController = require('../controllers/device.controller')
const Tag = require('../controllers/tag.controller')

router.get('/', deviceController.getAll)
router.post('/', deviceController.create)
router.put('/', deviceController.updateById)
router.delete('/', deviceController.drop)
router.get('/configs', deviceController.getConfigById)

router.get('/:id/tags', Tag.getAll)
router.put('/:id/tags', Tag.editAttribute)
router.delete('/:id/tags', Tag.deleteTag)
router.post('/:id/tags', Tag.addTag)

module.exports = router
