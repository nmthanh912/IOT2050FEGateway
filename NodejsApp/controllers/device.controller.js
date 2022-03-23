const {dbRun, dbAll, db} = require('../models/database')
const handler = require('./handler')
const uniqueId = require('../utils/uniqueId')

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
        console.log(req.body)
        const id = uniqueId()

        const insertDeviceQuery = 'INSERT INTO DEVICE (ID, name, description, protocolType) VALUES (?, ?, ?, ?)'
        const insertDeviceParams = [id, req.body.name, req.body.description, req.body.protocol.toUpperCase()]

        const protocolName = req.body.protocol.toUpperCase()
        var insertProtocolParams = Object.values(req.body.config)

        const tagList = req.body.tagList

        handler(res, async () => {
            await dbRun(insertDeviceQuery, insertDeviceParams)

            if (tagList.length !== 0) {
                tagList.forEach((tag) => {
                    tag.deviceID = id
                })

                const tagValues = tagList.map((tag) => Object.values(tag)).flat()
                const bracketValue = '(' + ',?'.repeat(Object.values(tagList[0]).length).slice(1) + '), '
                const insertProTag =
                    `INSERT INTO ${protocolName}_TAG VALUES ` + bracketValue.repeat(tagList.length).slice(0, -2)

                const bracketValueTag = '(' + ',?'.repeat(2).slice(1) + '), '
                const insertTag = `INSERT INTO TAG VALUES ` + bracketValueTag.repeat(tagList.length).slice(0, -2)
                const value = []
                tagValues.forEach((tag) =>
                    value.push({
                        deviceID: tag.deviceID,
                        name: tag.name,
                    })
                )

                db.serialize(() => {
                    db.run(insertProTag, tagValues)
                    db.run(insertTag, value)
                })
            }

            if (insertProtocolParams.length === 0) {
                const protocolInfoQuery = `PRAGMA table_info(${protocolName})`

                handler(res, async () => {
                    const infoProtocolTable = await dbAll(protocolInfoQuery)
                    insertProtocolParams = Array(infoProtocolTable.length - 1).fill(null)
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
            db.serialize(() => {
                db.run(editDeviceQuery, editDeviceParams)
                db.run(editProtocolQuery, editProtocolParams)
                res.json({
                    key: req.params.id,
                })
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
