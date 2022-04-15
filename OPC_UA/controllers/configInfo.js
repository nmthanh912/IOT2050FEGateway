const { config } = require('dotenv')
const {dbAll} = require('../models/dbConnect')

const redis = require('../redis/redisClient')
redis.pubConnection()

const getConfig = async (protocolName, id) => {
    const getDeviceQuery = `SELECT DEVICE.*, 
        ${protocolName}.url,
        GROUP_CONCAT(
        ${protocolName}_TAG.name || ',' || ${protocolName}_TAG.nodeid || ',' || ${protocolName}_TAG.unit , ':'
        ) as nodeInfo
    FROM DEVICE 
        JOIN ${protocolName} ON DEVICE.ID = ${protocolName}.deviceID
        JOIN TAG ON TAG.deviceID = DEVICE.ID 
        JOIN ${protocolName}_TAG ON ${protocolName}_TAG.deviceID = TAG.deviceID AND ${protocolName}_TAG.name = TAG.name
    WHERE DEVICE.ID = ?`
    try {
        const configInfo = await dbAll(getDeviceQuery, id)

        if (configInfo[0].ID !== null) {
            const nodeInfo = []
            const deviceConfig = []

            deviceConfig.push({
                ID: configInfo[0].ID,
                name: configInfo[0].name,
                scanningCycle: configInfo[0].scanningCycle,
                minRespTime: configInfo[0].minRespTime,
                url: configInfo[0].url,
            })
            console.log(configInfo[0])
            configInfo[0].nodeInfo.split(':').forEach((item) => {
                const nodeValue = item.split(',')
                nodeInfo.push({
                    name: nodeValue[0],
                    nodeid: nodeValue[1],
                    unit: nodeValue[2],
                })
            })

            return [{deviceConfig, nodeInfo}]
        } else {
            return []
        }
    } catch (err) {
        redis.pub2Redis('log', {serviceName: 'OPC_UA', level: 'error', errMsg: err})
        console.log(err)
        return []
    }
}

module.exports = getConfig
