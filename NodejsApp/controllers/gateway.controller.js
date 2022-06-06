require('dotenv').config()
const uniqueId = require('../utils/uniqueId')
const { dbRun, dbAll, db } = require('../models/database')
const handler = require('../utils/handler')
const fs = require('fs')
const util = require('util')

const writeFile = util.promisify(fs.writeFile.bind(fs))
const readFile = util.promisify(fs.readFile.bind(fs))
const unlink = util.promisify(fs.unlink.bind(fs))

const JSON_PATH = process.env.MODE === 'development' ? '../customJSON' : './customJSON'

class GatewayController {
    create(req, res) {
        const configData = req.body.config
        const ID = uniqueId()
        let gatewayData = [
            ID, 
            req.body.description, 
            req.body.name,
            configData.username,
            configData.password,
            configData.IP,
            configData.port,
            configData.QoS
        ]

        let protocol = req.body.protocol.toUpperCase()
        const sqlQuery = `
            INSERT INTO ${protocol} VALUES 
            (${'?,'.repeat(gatewayData.length).slice(0, -1)})
        `

        handler(res, async () => {
            await dbRun(sqlQuery, gatewayData)
            res.json({
                key: ID,
            })
        })
    }
    get(req, res) {
        const sqlQuery = `SELECT * FROM MQTT_CLIENT`
        handler(res, async () => {
            const gatewayList = await dbAll(sqlQuery, [])
            res.json(gatewayList)
        })
    }

    update(req, res) {
        const data = req.body
        const protocol = data.protocol

        const sqlQuery = `UPDATE ${protocol}
            SET 
                description = ?,
                name = ?,
                username = ?,
                password = ?,
                IP = ?,
                port = ?,
                QoS = ?
            WHERE ID = ?
        `
        handler(res, async () => {
            await dbRun(sqlQuery, [
                data.description,
                data.name,
                data.config.username,
                data.config.password,
                data.config.IP,
                data.config.port,
                data.config.QoS,
                req.query.id,
            ])
            res.json({ msg: 'success' })
        })
    }

    delete(req, res) {
        const gatewayID = req.query.id
        const sqlQuery = `DELETE FROM MQTT_CLIENT WHERE ID = ?`
        handler(res, async () => {
            await dbRun(sqlQuery, [gatewayID])

            const files = fs.readdirSync(JSON_PATH).filter(fn => fn.slice(0, 8) === gatewayID);
            const unlinkPromises = files.map(file => unlink(JSON_PATH + '/' + file))
            await Promise.allSettled(unlinkPromises)

            res.json({ msg: 'Success' })
        })
    }

    getSubcribedDevices(req, res) {
        const sqlQuery = `SELECT DEVICE.ID, DEVICE.name, DEVICE.protocolType as protocol
            FROM DEVICE JOIN SUBSCRIBES ON DEVICE.ID = SUBSCRIBES.deviceID
            WHERE SUBSCRIBES.gatewayID = ?
            GROUP BY DEVICE.ID
            ORDER BY DEVICE.name ASC
        `
        handler(res, async () => {
            const deviceList = await dbAll(sqlQuery, [req.query.id])
            console.log(deviceList)
            res.json(deviceList)
        })
    }

    addSubscribeDevices(req, res) {
        const { gatewayID, deviceIDList } = req.body
        // console.log(gatewayID, deviceIDList)
        const addSubsQuery = `
            INSERT INTO SUBSCRIBES VALUES 
            ${"(?, ?, ?),".repeat(deviceIDList.length).slice(0, -1)}
        `
        const subsParams = deviceIDList.map(deviceID => [gatewayID, deviceID, null]).flat(1)

        const addConfigQuery = `
            INSERT INTO CONFIGS VALUES 
            ${'(?, ?, ?),'.repeat(deviceIDList.length).slice(0, -1)}
        `
        const configParams = deviceIDList.map(deviceID => [gatewayID, deviceID, 0]).flat(1)
        handler(res, async () => {
            await dbRun(addSubsQuery, subsParams)
            await dbRun(addConfigQuery, configParams)
            res.json({ msg: 'OKE' })
        })
    }

    removeSubscribeDevice(req, res) {
        const { gid: gatewayID, did: deviceID } = req.query
        const deleteSubsQuery = `DELETE FROM subscribes WHERE gatewayID = ? AND deviceID = ?`
        const deleteConfigQuery = `DELETE FROM configs WHERE gatewayID = ? AND deviceID = ?`

        handler(res, async () => {
            const fileExists = fs.existsSync(JSON_PATH + '/' + gatewayID + '_' + deviceID + '.json')
            if (fileExists) {
                await unlink(JSON_PATH + '/' + gatewayID + '_' + deviceID + '.json')
            }
            await dbRun(deleteSubsQuery, [gatewayID, deviceID])
            await dbRun(deleteConfigQuery, [gatewayID, deviceID])
            res.json({ msg: 'OKE' })
        })
    }

    getSubcribedDeviceConfig(req, res) {
        const gatewayId = req.query.gid
        const deviceId = req.query.did
        const deviceProtocol = req.query.dp
        const sqlQuery = `SELECT name, gatewayID
            FROM ${deviceProtocol}_TAG LEFT JOIN SUBSCRIBES
                ON (
                    ${deviceProtocol}_TAG.name = SUBSCRIBES.tagName
                    AND ${deviceProtocol}_TAG.deviceID = SUBSCRIBES.deviceID
                    AND SUBSCRIBES.gatewayID = ?
                )
            WHERE ${deviceProtocol}_TAG.deviceID = ?
        `

        handler(res, async () => {
            const tagConfigList = await dbAll(sqlQuery, [gatewayId, deviceId])
            const list = tagConfigList.map((val) => {
                let subscribe = val.gatewayID !== null
                delete val.gatewayID
                return { subscribe, ...val }
            })

            const useCustomQuery = `SELECT toggle FROM configs WHERE gatewayID = ? AND deviceID = ?`
            let useCustom = await dbAll(useCustomQuery, [gatewayId, deviceId])

            let exists = fs.existsSync(`${JSON_PATH}/${gatewayId}_${deviceId}.json`)
            let code = null
            if (exists) code = await readFile(`${JSON_PATH}/${gatewayId}_${deviceId}.json`, 'utf-8')

            res.json({ tagList: list, code, toggle: useCustom[0].toggle })
        })
    }

    updateSubcribedDeviceConfig(req, res) {
        const { gid: gatewayID, did: deviceID } = req.params
        const data = req.body // code, tagList, toggle

        console.log(req.body)

        handler(res, async () => {
            const updateToggleQuery = `UPDATE configs SET toggle = ? WHERE gatewayID = ? AND deviceID = ?`
            await dbRun(updateToggleQuery, [data.toggle, gatewayID, deviceID])

            const customJSON = data.code.slice(data.code.indexOf('{'))
            await writeFile(`${JSON_PATH}/${gatewayID}_${deviceID}.json`, customJSON, 'utf-8')

            db.serialize(() => {
                let deleteSqlQuery = `DELETE FROM subscribes WHERE
                    gatewayID = ?
                    AND deviceID = ?
                `
                db.run(deleteSqlQuery, [gatewayID, deviceID])
                if (data.tagList.length > 0) {
                    let insertSqlQuery = `INSERT INTO subscribes
                        VALUES ${'(?, ?, ?),'.repeat(data.tagList.length).slice(0, -1)}
                    `
                    db.run(insertSqlQuery, data.tagList.map((val) => [gatewayID, deviceID, val.name]).flat())
                } else {
                    db.run('INSERT INTO subscribes VALUES (?, ?, ?)', [gatewayID, deviceID, null])
                }
            })
            res.json({ msg: 'OK' })
        })
    }
}

module.exports = new GatewayController()
