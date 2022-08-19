require('dotenv').config()
const uniqueId = require('../utils/uniqueId')
const { logError } = require('../utils')
const gatewayModel = require('../models/gateway.model')
const {
    INCORRECT_PROTOCOL_MESSAGE,
    BAD_REQUEST_CODE,
    INTERNAL_SERVER_ERROR_CODE
} = require('../constants/error')

class GatewayController {
    async create(req, res) {
        const gatewayData = {
            ID: uniqueId(),
            description: req.body.description,
            name: req.body.name,
            username: req.body.config.username,
            password: req.body.config.password,
            IP: req.body.config.IP,
            port: req.body.config.port,
            QoS: req.body.config.QoS
        }

        const protocolName = req.body.protocol.toUpperCase()
        try {
            await gatewayModel.create(gatewayData, protocolName);
            res.json({ key: gatewayData.ID })
        } catch (err) {
            logError(err.message)

            if (err.message === INCORRECT_PROTOCOL_MESSAGE) {
                res.status(BAD_REQUEST_CODE).json({ msg: err.message })
                return
            }
            res.status(INTERNAL_SERVER_ERROR_CODE).json({ msg: err.message })
        }
    }

    async get(req, res) {
        try {
            const gatewayList = await gatewayModel.getAll()
            res.json(gatewayList)
        } catch (err) {
            logError(err.message)
            res.status(INTERNAL_SERVER_ERROR_CODE).json({ msg: err.message })
        }
    }

    async update(req, res) {
        const protocolName = req.body.protocol
        const gatewayId = req.query.id
        const gatewayData = {
            description: req.body.description,
            name: req.body.name,
            username: req.body.username,
            password: req.body.password,
            IP: req.body.config.IP,
            port: req.body.config.port,
            QoS: req.body.config.QoS
        }
        try {
            await gatewayModel.update(gatewayId, gatewayData, protocolName);
            res.json({ msg: "success" })
        } catch (err) {
            logError(err.message)
            res.status(INTERNAL_SERVER_ERROR_CODE).json({ msg: err.message })
        }
    }

    async delete(req, res) {
        const gatewayId = req.query.id
        try {
            await gatewayModel.delete(gatewayId)
            res.json({ msg: "success" })
        } catch (err) {
            logError(err.message)
            res.status(INTERNAL_SERVER_ERROR_CODE).json({ msg: err.message })
        }
    }

    async getSubcribedDevices(req, res) {
        const gatewayId = req.query.gatewayId
        try {
            const deviceList = await gatewayModel.getSubscribedDevices(gatewayId)
            res.json(deviceList)
        } catch (err) {
            logError(err.message)
            res.status(INTERNAL_SERVER_ERROR_CODE).json({ msg: err.message })
        }
    }

    async addSubscribedDevices(req, res) {
        const { gatewayId, deviceIdList } = req.body
        try {
            await gatewayModel.addSubscribeDevices(gatewayId, deviceIdList)
            res.json({ msg: "OKE" })
        } catch (err) {
            logError(err.message)
            res.status(INTERNAL_SERVER_ERROR_CODE).json({ msg: err.message })
        }
    }

    async removeSubscribedDevice(req, res) {
        const { gatewayId, deviceId } = req.query
        try {
            await gatewayModel.removeSubscribedDevice(gatewayId, deviceId)
            res.json({ msg: "OKE" })
        } catch (err) {
            logError(err.message)
            res.status(INTERNAL_SERVER_ERROR_CODE).json({ msg: err.message })
        }
    }

    async getSubcribedDeviceConfig(req, res) {
        const { gatewayId, deviceId, deviceProtocol } = req.query
        try {
            const result = await gatewayModel.getSubcribedDeviceConfig(gatewayId, deviceId, deviceProtocol)
            res.json(result)
        } catch (err) {
            logError(err.message)
            res.status(INTERNAL_SERVER_ERROR_CODE).json({ msg: err.message })
        }
    }


    async updateSubcribedDeviceConfig(req, res) {
        const { gatewayId, deviceId } = req.query
        const config = req.body

        try {
            await gatewayModel.updateSubcribedDeviceConfig(gatewayId, deviceId, config)
            res.json({ msg: "OKE" })
        } catch (err) {
            logError(err.message)
            res.status(INTERNAL_SERVER_ERROR_CODE).json({ msg: err.message })
        }
    }
}

const gatewayController = new GatewayController()

module.exports = gatewayController
