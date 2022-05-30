require('dotenv').config()
const { dbRun, dbAll } = require('../models/database')
const handler = require('../utils/handler')
const uniqueId = require('../utils/uniqueId')

const util = require('util')
const fs = require('fs')
const unlink = util.promisify(fs.unlink.bind(fs))

const JSON_PATH = process.env.MODE === "development" ?
    '../customJSON' : './customJSON'

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

        return { proTagQuery, proTagParams, tagQuery, tagParams }
    }

    getAll = function (req, res) {
        const deviceQuery = `SELECT * FROM DEVICE`
        var data = []

        handler(res, async () => {
            const devices = await dbAll(deviceQuery, [])

            devices.map((device) => {
                const obj = {
                    ...device,
                    protocol: device.protocolType,
                }
                delete obj.protocolType
                data.push(obj)
            })

            res.json(data)
        })
    }

    createMany(req, res) {
        const { data, repNum: replicateNumber } = req.body
        const hasTag = data.tagList.length > 0

        let deviceList = []
        const insertManyDeviceQuery = `
            INSERT INTO DEVICE VALUES
            ${'(?, ?, ?, ? ,? ,? ,?, ?),'.repeat(replicateNumber).slice(0, -1)}
        `

        const protocolName = data.protocol.toUpperCase()
        let config = Object.values(data.config)
        let configList = []
        let configBracketStr = '(' + ',?'.repeat(config.length + 1).slice(1) + '),'
        const insertManyDeviceConfigQuery = `
            INSERT INTO ${protocolName} VALUES
            ${configBracketStr.repeat(replicateNumber).slice(0, -1)}
        `

        let tagListAll = []
        const insertManyTagQuery = `
            INSERT INTO TAG (deviceID, name) VALUES
            ${'(?, ?),'.repeat(replicateNumber * data.tagList.length).slice(0, -1)}
        `

        let protocolTagListAll = []
        let proTagBracketValue = hasTag ? 
            '(' + ',?'.repeat(Object.values(data.tagList[0]).length + 1).slice(1) + '),'
            : '()'
        const insertManyProtocolTagQuery = `
            INSERT INTO ${protocolName}_TAG VALUES
            ${proTagBracketValue.repeat(replicateNumber * data.tagList.length).slice(0, -1)}
        `

        const device = [
            data.description,
            data.protocol.toUpperCase(),
            data.byteOrder,
            data.wordOrder,
            data.scanningCycle,
            data.minRespTime,
        ]

        const range = [...Array(replicateNumber).keys()]

        const keyList = []
        for (let i in range) {
            let deviceID = uniqueId()
            keyList.push(deviceID)
            let deviceName = data.name + `_${i}`

            deviceList.push([deviceID, deviceName, ...device])

            let tagList = data.tagList.map(tag => [deviceID, tag.name])
            tagListAll.push(tagList)

            let protocolTagList = data.tagList.map(tag => [...Object.values(tag), deviceID])
            protocolTagListAll.push(protocolTagList)

            configList.push([...config], deviceID)
        }

        deviceList = deviceList.flat()
        tagListAll = tagListAll.flat(2)
        protocolTagListAll = protocolTagListAll.flat(2)
        configList = configList.flat()

        handler(res, async () => {
            await dbRun(insertManyDeviceQuery, deviceList)
            await dbRun(insertManyDeviceConfigQuery, configList)

            if (hasTag) {
                await dbRun(insertManyTagQuery, tagListAll)
                await dbRun(insertManyProtocolTagQuery, protocolTagListAll)
            }

            res.json({
                keyList
            })
        })
    }

    create(req, res) {
        const id = uniqueId()
        const { data } = req.body
        const deviceQuery = `INSERT INTO DEVICE 
            (ID, name, description, protocolType, byteOrder, wordOrder, scanningCycle, minRespTime) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        const deviceParams = [
            id,
            data.name,
            data.description,
            data.protocol.toUpperCase(),
            data.byteOrder,
            data.wordOrder,
            data.scanningCycle,
            data.minRespTime,
        ]

        const protocolName = data.protocol.toUpperCase()
        let protocolParams = Object.values(data.config)

        const tagList = data.tagList

        handler(res, async () => {
            if (protocolParams.length === 0) {
                const proInfoQuery = `PRAGMA table_info(${protocolName})`
                const infoProTable = await dbAll(proInfoQuery)
                protocolParams = Array(infoProTable.length - 1).fill(null)
            }
            protocolParams.push(id)
            const protocolQuery = `INSERT INTO ${protocolName} VALUES (${',?'.repeat(protocolParams.length).slice(1)})`

            if (tagList.length !== 0 && Object.keys(tagList[0]).length !== 0) {
                const { proTagQuery, proTagParams, tagQuery, tagParams } = this.setupTagSql(tagList, protocolName, id)

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
                keyList: [id],
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
        const deviceQuery = `UPDATE DEVICE 
            SET name = ?, 
            description = ?,
            byteOrder = ?,
            wordOrder = ?,
            scanningCycle = ?,
            minRespTime = ?
        WHERE ID = ?`
        const deviceParams = [
            req.body.name,
            req.body.description,
            req.body.byteOrder,
            req.body.wordOrder,
            req.body.scanningCycle,
            req.body.minRespTime,
            id,
        ]

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

            if (tagList.length !== 0 && tagList[0].name !== '') {
                const { proTagQuery, proTagParams, tagQuery, tagParams } = this.setupTagSql(tagList, protocolName, id)
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
        const deleteDeviceQuery = 'DELETE FROM DEVICE WHERE ID = ?'
        const deviceID = req.params.id

        handler(res, async () => {
            await dbRun(deleteDeviceQuery, [deviceID])

            const files = fs.readdirSync(JSON_PATH).filter((fn) => fn.slice(9, 17) === deviceID)
            const unlinkPromises = files.map((file) => unlink(JSON_PATH + '/' + file))
            await Promise.allSettled(unlinkPromises)

            res.json({
                key: deviceID,
            })
        })
    }
}

module.exports = new Device()
