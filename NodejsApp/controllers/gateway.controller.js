require('dotenv').config()
const uniqueId = require('../utils/uniqueId')
const { dbRun, dbAll, db } = require('../models/database')
const handler = require('../utils/handler')
const fs = require('fs')
const util = require('util')
const { logError } = require('../utils')

const writeFile = util.promisify(fs.writeFile.bind(fs))
const readFile = util.promisify(fs.readFile.bind(fs))
const unlink = util.promisify(fs.unlink.bind(fs))

const JSON_PATH = process.env.CUSTOM_JSON_PATH

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
            res.json(deviceList)
        })
    }

    async addSubscribeDevices(req, res) {
        const { gatewayID, deviceIDList } = req.body

        try {
            await dbRun("BEGIN TRANSACTION")
            for (let deviceID of deviceIDList) {
                await dbRun(`INSERT INTO subscribes VALUES (?, ?, ?)`, [gatewayID, deviceID, null])
                await dbRun(`INSERT OR IGNORE INTO configs VALUES (?, ?, ?)`, [gatewayID, deviceID, 0])
            }
            await dbRun("COMMIT")
            res.json({ msg: "OKE" })
        } catch (err) {
            logError(err.message)
            await dbRun("ROLLBACK TRANSACTION")
            res.status(500).json({ msg: err.message })
        }
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

            // Can be rewrite by try catch
            let exists = fs.existsSync(`${JSON_PATH}/${gatewayId}_${deviceId}.json`)
            let code = null
            if (exists) code = await readFile(`${JSON_PATH}/${gatewayId}_${deviceId}.json`, 'utf-8')
            // ==============

            const result = { tagList: list, code, toggle: useCustom[0].toggle }
            res.json(result)
        })
    }

    async updateSubcribedDeviceConfig(req, res) {
        const { gid: gatewayID, did: deviceID } = req.params
        const data = req.body // code, tagList, toggle
        try {
            await dbRun("BEGIN TRANSACTION")
            const updateToggleQuery = `UPDATE configs SET toggle = ? WHERE gatewayID = ? AND deviceID = ?`
            await dbRun(updateToggleQuery, [data.toggle, gatewayID, deviceID])

            const customJSON = data.code.slice(data.code.indexOf('{'))
            await writeFile(`${JSON_PATH}/${gatewayID}_${deviceID}.json`, customJSON, 'utf-8')


            let deleteSqlQuery = `DELETE FROM subscribes WHERE
                    gatewayID = ?
                    AND deviceID = ?
                `
            await dbRun(deleteSqlQuery, [gatewayID, deviceID])

            if (data.tagList.length > 0) {
                for (let tag of data.tagList) {
                    await dbRun("INSERT INTO subscribes VALUES (?, ?, ?)", [gatewayID, deviceID, tag.name])
                }
            } else {
                await dbRun('INSERT INTO subscribes VALUES (?, ?, ?)', [gatewayID, deviceID, null])
            }
            await dbRun("COMMIT")
            res.json({ msg: 'OK' })

        } catch (err) {
            logError(err.message)
            console.log(err)
            await dbRun("ROLLBACK TRANSACTION")
            res.status(500).json({ msg: err.message })
        }
    }
}

module.exports = new GatewayController()
