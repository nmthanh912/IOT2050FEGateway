const uniqueId = require('../utils/uniqueId')
const {dbRun, dbAll, db} = require('../models/database')
const handler = require('../utils/handler')
const fs = require('fs')
const util = require('util')

const writeFile = util.promisify(fs.writeFile.bind(fs))
const readFile = util.promisify(fs.readFile.bind(fs))
const rm = util.promisify(fs.rm.bind(fs))

class GatewayController {
    create(req, res) {
        let gatewayData = []
        let infoData = [req.body.description, req.body.name]
        let configData = Object.values(req.body.config)
        let ID = uniqueId()
        gatewayData.push(ID)
        gatewayData = gatewayData.concat(infoData).concat(configData)
        gatewayData[gatewayData.length - 1] = parseInt(gatewayData[gatewayData.length - 1])

        let protocol = req.body.protocol.toUpperCase()
        const sqlQuery = `INSERT INTO ${protocol} VALUES (${'?,'.repeat(gatewayData.length).slice(0, -1)})`

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
        console.log(req.query.id)
        const data = req.body
        console.log(data)
        const protocol = data.protocol

        const sqlQuery = `UPDATE ${protocol}
            SET 
                description = ?,
                name = ?,
                username = ?,
                password = ?,
                IP = ?,
                port = ?
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
                req.query.id,
            ])
            res.json({msg: 'success'})
        })
    }

    delete(req, res) {
        const gatewayID = req.query.id
        const sqlQuery = `DELETE FROM mqtt_client WHERE ID = ?`
        handler(res, async () => {
            await dbRun(sqlQuery, [gatewayID])

            const files = fs.readdirSync('../customJSON').filter(fn => fn.slice(0, 8) === gatewayID);
            const unlinkPromises = files.map(file => unlink('../customJSON/' + file))
            await Promise.all(unlinkPromises)

            res.json({ msg: 'Success' })
        })
    }

    getSubcribedDevices(req, res) {
        const sqlQuery = `SELECT DEVICE.ID, DEVICE.name, DEVICE.protocolType as protocol
            FROM DEVICE JOIN SUBSCRIBES ON DEVICE.ID = SUBSCRIBES.deviceID
            WHERE SUBSCRIBES.gatewayID = ?
            GROUP BY DEVICE.ID
        `
        handler(res, async () => {
            const deviceList = await dbAll(sqlQuery, [req.query.id])
            res.json(deviceList)
        })
    }
    addSubscribeDevice(req, res) {
        const { gatewayID, deviceID } = req.body
        const addSubsQuery = `INSERT INTO subscribes VALUES (?, ?, ?)`
        const addConfigQuery = `INSERT INTO configs VALUES (?, ?, ?)`
        handler(res, async () => {
            await dbRun(addSubsQuery, [gatewayID, deviceID, null])
            await dbRun(addConfigQuery, [gatewayID, deviceID, 0])
            res.json({ msg: 'OKE' })
        })
    }
    removeSubscribeDevice(req, res) {
        console.log(req.query)
        const { gid: gatewayID, did: deviceID } = req.query
        const deleteSubsQuery = `DELETE FROM subscribes WHERE gatewayID = ? AND deviceID = ?`
        const deleteConfigQuery = `DELETE FROM configs WHERE gatewayID = ? AND deviceID = ?`
        handler(res, async () => {
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
                return {subscribe, ...val}
            })

            // console.log([gatewayId, deviceId])
            const useCustomQuery = `SELECT toggle FROM configs WHERE gatewayID = ? AND deviceID = ?`
            let useCustom = await dbAll(useCustomQuery, [gatewayId, deviceId])

            let exists = fs.existsSync(`../customJSON/${gatewayId}_${deviceId}.json`)
            let code = null
            if (exists) code = await readFile(`../customJSON/${gatewayId}_${deviceId}.json`, 'utf-8')


            res.json({ tagList: list, code, toggle: useCustom[0].toggle })
            // }
        })
    }

    updateSubcribedDeviceConfig(req, res) {
        const { gid: gatewayID, did: deviceID } = req.params
        const data = req.body // code, tagList, toggle
        console.log(req.params)

        handler(res, async () => {
            const updateToggleQuery = `UPDATE configs SET toggle = ? WHERE gatewayID = ? AND deviceID = ?`
            await dbRun(updateToggleQuery, [data.toggle, gatewayID, deviceID])

            const customJSON = data.code.slice(data.code.indexOf('{'))
            await writeFile(`../customJSON/${gatewayID}_${deviceID}.json`, customJSON, 'utf-8')

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
            res.json({msg: 'OK'})
        })
    }
}

module.exports = new GatewayController()