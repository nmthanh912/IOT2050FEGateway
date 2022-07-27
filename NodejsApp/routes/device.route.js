const express = require('express')
const router = express.Router()
const deviceController = require('../controllers/device.controller')
const Tag = require('../controllers/tag.controller')

router.get('/', deviceController.getAll)

router.post('/new', function (req, res) {
    parseInt(req.body.repNum) === 1 ? 
        deviceController.create(req, res) : 
        deviceController.createMany(req, res)
})

router.get('/:id/config', deviceController.getConfigById)
router.put('/:id/edit', deviceController.updateById)
router.delete('/:id', deviceController.drop)

router.get('/:id/tags', Tag.getAll)
router.put('/:id/tags/edit', Tag.editAttribute)
router.delete('/:id/tag', Tag.deleteTag)
router.post('/:id/tags/add', Tag.addTag)

module.exports = router
