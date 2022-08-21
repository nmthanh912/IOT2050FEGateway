const { INTERNAL_SERVER_ERROR_CODE } = require('../constants/error.js')
const tagModel = require('../models/tag.model.js')
const { logError } = require('../utils/logger.js')

class Tag {
    getAll = async function (req, res) {
        const protocolName = req.query.protocol
        const deviceId = req.params.id
        try {
            const tags = await tagModel.getAll(deviceId, protocolName)
            res.json(tags)
        } catch (err) {
            logError(err.message)
            console.log(err)
            res.status(INTERNAL_SERVER_ERROR_CODE).json({ msg: err.message })
        }
    }
    async editAttribute(req, res) {
        const deviceId = req.params.id
        const { protocol: protocolName, tagName, attrName } = req.query
        const newValue = req.body.newValue

        try {
            await tagModel.editAttribute(deviceId, protocolName, tagName, attrName, newValue)
            res.json({ msg: 'OK' })
        } catch (err) {
            logError(err.message)
            res.status(INTERNAL_SERVER_ERROR_CODE).json({ msg: err.message })
        }
    }
    async deleteTag(req, res) {
        const deviceId = req.params.id
        const tagName = req.query.tagName
        try {
            await tagModel.delete(deviceId, tagName)
            res.json({ msg: 'OKE' })
        } catch (err) {
            logError(err.message)
            res.status(INTERNAL_SERVER_ERROR_CODE).json({ msg: err.message })
        }
    }
    async addTag(req, res) {
        const deviceId = req.params.id
        const protocolName = req.query.protocol

        const tag = req.body

        try {
            await tagModel.add(deviceId, protocolName, tag)
            res.json({ msg: "OKE" })
        } catch (err) {
            logError(err.message)
            res.status(INTERNAL_SERVER_ERROR_CODE).json({ msg: err.message })
        }
    }
}

module.exports = new Tag()
