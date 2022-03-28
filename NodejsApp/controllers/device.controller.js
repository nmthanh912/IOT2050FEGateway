const {dbRun, dbAll, dbSerialize, db} = require('../models/database')
const handler = require('../utils/handler')
const uniqueId = require('../utils/uniqueId')
const Redis = require('ioredis')
const redis = new Redis()

const create = 'CREATE'
const update = 'UPDATE'
const drop = 'DROP'

class Device {
    handleErrCreate = async (id) => {
        const getDevice = `SELECT * FROM DEVICE WHERE ID = ?`
        const device = await dbAll(getDevice, id)

        if (device) {
            const deleteQuery = `DELETE FROM DEVICE WHERE ID = ?`
            await dbRun(deleteQuery, id)
        }
    }

    setupTagSql = (tagList, protocolName, id) => {
        tagList.forEach((tag) => {
            tag.deviceID = id
        })

        const bracketValue = '(' + ',?'.repeat(Object.values(tagList[0]).length).slice(1) + '), '
        const proTagQuery = `INSERT INTO ${protocolName}_TAG VALUES ` + bracketValue.repeat(tagList.length).slice(0, -2)
        const proTagParams = tagList.map((tag) => Object.values(tag)).flat()

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

        return {proTagQuery, proTagParams, tagQuery, tagParams}
    }

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

    create = (req, res) => {
        const id = uniqueId()
        const deviceQuery = 'INSERT INTO DEVICE (ID, name, description, protocolType) VALUES (?, ?, ?, ?)'
        const deviceParams = [id, req.body.name, req.body.description, req.body.protocol.toUpperCase()]

        const protocolName = req.body.protocol.toUpperCase()
        var protocolParams = Object.values(req.body.config)

        const tagList = req.body.tagList

        redis.publish(create, JSON.stringify({config: req.body, id}))

        handler(res, async () => {
            if (protocolParams.length === 0) {
                const proInfoQuery = `PRAGMA table_info(${protocolName})`
                const infoProTable = await dbAll(proInfoQuery)
                protocolParams = Array(infoProTable.length - 1).fill(null)
            }
            protocolParams.push(id)
            const protocolQuery = `INSERT INTO ${protocolName} VALUES (${',?'.repeat(protocolParams.length).slice(1)})`

            if (tagList.length !== 0) {
                const {proTagQuery, proTagParams, tagQuery, tagParams} = this.setupTagSql(tagList, protocolName, id)

                try {
                    await Promise.all([
                        dbRun(deviceQuery, deviceParams),
                        dbRun(protocolQuery, protocolParams),
                        dbRun(tagQuery, tagParams),
                        dbRun(proTagQuery, proTagParams),
                    ])
                } catch (err) {
                    await this.handleErrCreate(id)
                    throw err
                }
            } else {
                try {
                    await Promise.all([dbRun(deviceQuery, deviceParams), dbRun(protocolQuery, protocolParams)])
                } catch (err) {
                    await this.handleErrCreate(id)
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

    editInfo = (req, res) => {
        const id = req.params.id
        const deviceQuery = 'UPDATE DEVICE SET name = ?, description = ? WHERE ID = ?'
        const deviceParams = [req.body.name, req.body.description, id]

        var setString = 'SET '
        const keys = Object.keys(req.body.config)
        keys.forEach((key) => {
            setString += key + ' = ?, '
        })
        const protocolName = req.body.protocol.toUpperCase()
        const protocolQuery = `UPDATE ${protocolName} ${setString.slice(0, setString.length - 2)} WHERE deviceID = ?`
        const protocolParams = Object.values(req.body.config)
        protocolParams.push(id)

        const tagList = req.body.tagList

        handler(res, async () => {
            const deleteQuery = `DELETE FROM TAG WHERE deviceID = ?`
            await dbRun(deleteQuery, id)

            if (tagList.length !== 0) {
                const {proTagQuery, proTagParams, tagQuery, tagParams} = this.setupTagSql(tagList, protocolName, id)

                await Promise.all([
                    dbRun(deviceQuery, deviceParams),
                    dbRun(protocolQuery, protocolParams),
                    dbRun(tagQuery, tagParams),
                    dbRun(proTagQuery, proTagParams),
                ])
            } else {
                await Promise.all([dbRun(deviceQuery, deviceParams), dbRun(protocolQuery, protocolParams)])
            }
            res.json({
                key: id,
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
