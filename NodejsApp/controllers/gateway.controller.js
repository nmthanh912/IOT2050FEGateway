const uniqueId = require('../utils/uniqueId')
const {dbRun, dbAll} = require('../models/database')
const handler = require('./handler')

class GatewayController {
    create(req, res) {
        console.log(req.body)
        let gatewayData = []
        let infoData = [req.body.name, req.body.description]
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

    getSubcribedDevices(req, res) {
        console.log(req.query.id)
        const sqlQuery = `SELECT DEVICE.ID, DEVICE.name, DEVICE.protocolType
            FROM DEVICE JOIN SUBCRIBES ON DEVICE.ID = SUBCRIBES.deviceID
            WHERE SUBCRIBES.gatewayID = ?
            GROUP BY DEVICE.ID
        `
        handler(res, async () => {
            const deviceList = await dbAll(sqlQuery, [req.query.id])
            console.log(deviceList)
            res.json(deviceList)
        })
    }
}

module.exports = new GatewayController()
