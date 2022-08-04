const express = require('express')
const { BAD_REQUEST_CODE } = require('../constants/errCode')
const router = express.Router()
const deviceController = require('../controllers/device.controller')
const Tag = require('../controllers/tag.controller')

router.get('/', deviceController.getAll)
router.post('/', function (req, res) {
    const repNum = parseInt(req.body.repNum)
    if (repNum === 1)
        deviceController.create(req, res)
    else if (repNum > 1)
        deviceController.createMany(req, res)
    else {
        res.status(BAD_REQUEST_CODE).json({
            msg: "Replicate number of a device must be positive"
        })
    }
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
