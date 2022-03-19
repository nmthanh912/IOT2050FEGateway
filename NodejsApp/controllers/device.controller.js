const ShortUniqueId = require('short-unique-id')
const {dbRun, dbAll} = require('../models/database')
const handler = require('./handler')
const eventEmitter = require('../eventEmitter/emit')

class Device {
    getAll = function (req, res) {
        const getDeviceQuery = `SELECT * FROM DEVICE`
        var data = []

        handler(res, async () => {
            const devices = await dbAll(getDeviceQuery, [])

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

    create = function (req, res) {
        const uid = new ShortUniqueId({
            dictionary: 'hex',
            length: 8,
        })
        const id = uid()

        const insertDeviceQuery = 'INSERT INTO DEVICE (ID, name, description, protocolType) VALUES (?, ?, ?, ?)'
        const insertDeviceParams = [id, req.body.name, req.body.description, req.body.protocol.toUpperCase()]

        const protocolName = req.body.protocol.toUpperCase()
        var insertProtocolParams = Object.values(req.body.config)

        const tagList = req.body.tagList
        tagList.forEach((tag) => {
            tag.deviceID = id
        })

        handler(res, async () => {
            await dbRun(insertDeviceQuery, insertDeviceParams)

            if (tagList.length != 0) {
                const tagValues = tagList.map((tag) => Object.values(tag)).flat()
                const insertTagStr = `INSERT INTO ${protocolName}_TAG VALUES `
                const bracketValue = '(' + ',?'.repeat(Object.values(tagList[0]).length).slice(1) + '), '
                const insertTagQuery = insertTagStr + bracketValue.repeat(tagList.length).slice(0, -2)

                await dbRun(insertTagQuery, tagValues)
            }

            if (insertProtocolParams.length == 0) {
                const protocolInfoQuery = `PRAGMA table_info(${protocolName})`

                handler(res, async () => {
                    const infoProtocolTable = await dbAll(protocolInfoQuery)
                    insertProtocolParams = Array(infoProtocolTable.length - 1).fill('NULL')
                    insertProtocolParams.push(id)

                    const insertProtocolQuery = `INSERT INTO ${protocolName} VALUES (${',?'
                        .repeat(insertProtocolParams.length)
                        .slice(1)})`
                    await dbRun(insertProtocolQuery, insertProtocolParams)
                    res.json({
                        key: id,
                    })
                })
            } else {
                insertProtocolParams.push(id)
                const insertProtocolQuery = `INSERT INTO ${protocolName} VALUES (${',?'
                    .repeat(insertProtocolParams.length)
                    .slice(1)})`

                handler(res, async () => {
                    await dbRun(insertProtocolQuery, insertProtocolParams)
                    res.json({
                        key: id,
                    })
                })
            }
        })
    }

    getById = function (req, res) {
        const getDeviceQuery = 'SELECT * FROM DEVICE WHERE DEVICE.ID = ?'
        const getDeviceParams = req.params.id

        handler(res, async () => {
            const device = await dbAll(getDeviceQuery, getDeviceParams)

            res.json({
                ID: device[0].ID,
                name: device[0].name,
                description: device[0].description,
                protocol: device[0].protocolType,
            })
        })
    }

    getConfigById = function (req, res) {
        const deviceID = req.params.id
        const protocolName = req.query.protocol.toUpperCase()
        const getConfigQuery = `SELECT * FROM ${protocolName} WHERE ${protocolName}.deviceID = ?`

        handler(res, async () => {
            const config = await dbAll(getConfigQuery, deviceID)
            if (config.length == 0) {
                res.json(config)
            } else {
                delete config[0].deviceID
                res.json(config[0])
            }
        })
    }

    editInfo = function (req, res) {
        const editDeviceQuery = 'UPDATE DEVICE SET name = ?, description = ? WHERE ID = ?'
        const editDeviceParams = [req.body.name, req.body.description, req.params.id]

        var setString = 'SET '
        const keys = Object.keys(req.body.config)

        keys.forEach((key) => {
            setString += key + ' = ?, '
        })

        const protocolName = req.body.protocol.toUpperCase()
        const editProtocolQuery = `UPDATE ${protocolName} ${setString.slice(
            0,
            setString.length - 2
        )} WHERE deviceID = ?`

        const editProtocolParams = Object.values(req.body.config)
        editProtocolParams.push(req.params.id)

        handler(res, async () => {
            await dbRun(editDeviceQuery, editDeviceParams)
            await dbRun(editProtocolQuery, editProtocolParams)

            eventEmitter.emit('device/updateInfo')

            res.json({
                key: req.params.id,
            })
        })
    }

    drop = function (req, res) {
        const deleteDeviceQuery = 'DELETE FROM DEVICE WHERE ID = ?'
        const deleteDeviceParams = [req.params.id]

        handler(res, async () => {
            await dbRun(deleteDeviceQuery, deleteDeviceParams)

            res.json({
                key: req.params.id,
            })
        })
    }
}

module.exports = new Device()
