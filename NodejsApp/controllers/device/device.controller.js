const {symlink} = require('fs')
const ShortUniqueId = require('short-unique-id')
const util = require('util')
const {db, dbRun, dbAll} = require('../../models/database')
const handler = require('../handler')

module.exports.getAllDevice = function (req, res) {
    const getDevice = `SELECT * FROM DEVICE`
    const params = []
    var data = []

    handler(res, async () => {
        const devices = await dbAll(getDevice, params)

        devices.map((device) => {
            data.push({
                ID: device.ID,
                name: device.name,
                description: device.description,
                protocol: device.protocolType,
            })
        })

        res.json(data)
    })
}

module.exports.postDevice = function (req, res) {
    const uid = new ShortUniqueId({
        dictionary: 'hex',
        length: 8,
    })
    const id = uid()

    const insertDevice =
        'INSERT INTO DEVICE (ID, name, description, protocolType) VALUES (?, ?, ?, ?)'
    const deviceParams = [
        id,
        req.body.name,
        req.body.description,
        req.body.protocol.toUpperCase(),
    ]

    const protocolName = req.body.protocol.toUpperCase()
    var protocolParams = Object.values(req.body.config)

    if (protocolParams.length == 0) {
        const getTableInfo = `PRAGMA table_info(${protocolName})`
        handler(res, async () => {
            const infoTable = await dbAll(getTableInfo)
            protocolParams = Array(infoTable.length - 1).fill('NULL')
            protocolParams.push(id)

            const insertProtocol = `INSERT INTO ${protocolName} VALUES (${',?'
                .repeat(protocolParams.length)
                .slice(1)})`

            await dbRun(insertDevice, deviceParams)
            await dbRun(insertProtocol, protocolParams)

            res.json({
                key: id,
            })
        })
    } else {
        protocolParams.push(id)
        const insertProtocol = `INSERT INTO ${protocolName} VALUES (${',?'
            .repeat(protocolParams.length)
            .slice(1)})`

        handler(res, async () => {
            await dbRun(insertDevice, deviceParams)
            await dbRun(insertProtocol, protocolParams)
            
            res.json({
                key: id,
            })
        })
    }
}

module.exports.getDevice = function (req, res) {
    const getDevice = 'SELECT * FROM DEVICE WHERE DEVICE.ID = ?'
    const params = req.params.id

    handler(res, async () => {
        const device = await dbAll(getDevice, params)

        console.log(device)
        res.json({
            ID: device[0].ID,
            name: device[0].name,
            description: device[0].description,
            protocol: device[0].protocolType,
        })
    })
}

module.exports.getDeviceConfig = function (req, res) {
    const deviceID = req.params.id
    const protocolName = req.query.protocol.toUpperCase()

    const getConfig = `SELECT * FROM ${protocolName} WHERE ${protocolName}.deviceID = ?`

    handler(res, async () => {
        const config = await dbAll(getConfig, deviceID)
        if (config.length == 0) {
            res.json(config)
        } else {
            delete config[0].deviceID
            res.json(config[0])
        }
    })
}

module.exports.editDeviceInfo = function (req, res) {
    const editDevice =
        'UPDATE DEVICE SET name = ?, description = ? WHERE ID = ?'
    const deviceParams = [req.body.name, req.body.description, req.params.id]

    var setString = 'SET '
    const keys = Object.keys(req.body.config)
    keys.forEach((key) => {
        setString += key + ' = ?, '
    })

    const protocolName = req.body.protocol.toUpperCase()
    const editProtocol = `UPDATE ${protocolName} ${setString.slice(
        0,
        setString.length - 2
    )} WHERE deviceID = ?`

    const protocolParams = Object.values(req.body.config)
    protocolParams.push(req.params.id)

    handler(res, async () => {
        await dbRun(editDevice, deviceParams)
        await dbRun(editProtocol, protocolParams)

        res.json({
            key: req.params.id,
        })
    })
}

module.exports.deleteDeviceInfo = function (req, res) {
    const deleteDevice = 'DELETE FROM DEVICE WHERE ID = ?'
    const params = [req.params.id]

    const protocolName = req.query.protocol.toUpperCase()
    const deleteProtocol = `DELETE FROM ${protocolName} WHERE deviceID = ?`

    const deleteTag = `DELETE FROM ${protocolName}_TAG WHERE deviceID = ?`

    handler(res, async () => {
        await dbRun(deleteDevice, params)
        await dbRun(deleteProtocol, params)
        await dbRun(deleteTag, params)

        res.json({
            key: req.params.id,
        })
    })
}
