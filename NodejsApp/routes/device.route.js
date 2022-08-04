const express = require('express')
const router = express.Router()
const deviceController = require('../controllers/device.controller')
const Tag = require('../controllers/tag.controller')

router.get('/', deviceController.getAll)
router.post('/', function (req, res) {
    parseInt(req.body.repNum) === 1 ? 
        deviceController.create(req, res) : 
        deviceController.createMany(req, res)
})
router.put('/', deviceController.updateById)
router.delete('/', deviceController.drop)
router.get('/configs', deviceController.getConfigById)


router.get('/:id/tags', Tag.getAll)
// ?
router.put('/:id/tags/edit', Tag.editAttribute)
// ?
router.delete('/:id/tag', Tag.deleteTag)
// ?
router.post('/:id/tags/add', Tag.addTag)

module.exports = router
