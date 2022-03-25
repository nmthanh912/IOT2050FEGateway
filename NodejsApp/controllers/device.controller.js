const {dbRun, dbAll, db} = require('../models/database')
const handler = require('./handler')
const uniqueId = require('../utils/uniqueId')

class Device {
    getAll = function (req, res) {
        const deviceQuery = `SELECT * FROM DEVICE`
        var data = []

        handler(res, async () => {
            const devices = await dbAll(deviceQuery, [])

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
        const id = uniqueId()

        const deviceQuery = 'INSERT INTO DEVICE (ID, name, description, protocolType) VALUES (?, ?, ?, ?)'
        const deviceParams = [id, req.body.name, req.body.description, req.body.protocol.toUpperCase()]

        const protocolName = req.body.protocol.toUpperCase()
        var protocolParams = Object.values(req.body.config)

        const tagList = req.body.tagList

        handler(res, async () => {
            if (protocolParams.length === 0) {
                const proInfoQuery = `PRAGMA table_info(${protocolName})`
                const infoProTable = await dbAll(proInfoQuery)
                protocolParams = Array(infoProTable.length - 1).fill(null)
            }
            protocolParams.push(id)
            const protocolQuery = `INSERT INTO ${protocolName} VALUES (${',?'.repeat(protocolParams.length).slice(1)})`

            if (Object.keys(tagList[0]).length !== 0) {
                tagList.forEach((tag) => {
                    tag.deviceID = id
                })

                const proTagParams = tagList.map((tag) => Object.values(tag)).flat()
                const bracketValue = '(' + ',?'.repeat(Object.values(tagList[0]).length).slice(1) + '), '
                const proTagQuery =
                    `INSERT INTO ${protocolName}_TAG VALUES ` + bracketValue.repeat(tagList.length).slice(0, -2)

                const bracketValueTag = '(' + ',?'.repeat(2).slice(1) + '), '
                const tagQuery = `INSERT INTO TAG VALUES ` + bracketValueTag.repeat(tagList.length).slice(0, -2)
                const values = []
                tagList.forEach((tag) =>
                    values.push({
                        deviceID: tag.deviceID,
                        name: tag.name,
                    })
                )
                const tagParams = values.map((value) => Object.values(value)).flat()

                try {
                    await Promise.all([
                        dbRun(deviceQuery, deviceParams),
                        dbRun(protocolQuery, protocolParams),
                        dbRun(tagQuery, tagParams),
                        dbRun(proTagQuery, proTagParams),
                    ])
                } catch (err) {
                    console.log('error')
                    const getDevice = `SELECT * FROM DEVICE WHERE ID = ?`
                    const device = await dbAll(getDevice, id)

                    if (device) {
                        const deleteQuery = `DELETE FROM DEVICE WHERE ID = ?`
                        await dbRun(deleteQuery, id)
                    }
                    throw err
                }
            } else {
                try {
                    await Promise.all([dbRun(deviceQuery, deviceParams), dbRun(protocolQuery, protocolParams)])
                } catch (err) {
                    const getDevice = `SELECT * FROM DEVICE WHERE ID = ?`
                    const device = await dbAll(getDevice, id)

                    if (device) {
                        const deleteQuery = `DELETE FROM DEVICE WHERE ID = ?`
                        await dbRun(deleteQuery, id)
                    }
                    throw err
                }
            }

            res.json({
                key: id,
            })
        })
    }

    getById = function (req, res) {
        const deviceQuery = 'SELECT * FROM DEVICE WHERE DEVICE.ID = ?'
        const deviceParams = req.params.id

        handler(res, async () => {
            const device = await dbAll(deviceQuery, deviceParams)

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
        const configQuery = `SELECT * FROM ${protocolName} WHERE ${protocolName}.deviceID = ?`

        handler(res, async () => {
            const config = await dbAll(configQuery, deviceID)
            if (config.length == 0) {
                res.json(config)
            } else {
                delete config[0].deviceID
                res.json(config[0])
            }
        })
    }

    editInfo = function (req, res) {
        console.log(req.body)
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
        const deviceQuery = 'DELETE FROM DEVICE WHERE ID = ?'
        const deviceParams = [req.params.id]

        handler(res, async () => {
            await dbRun(deviceQuery, deviceParams)

            res.json({
                key: req.params.id,
            })
        })
    }
}

module.exports = new Device()
