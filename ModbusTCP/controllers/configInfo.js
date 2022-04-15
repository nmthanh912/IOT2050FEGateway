const {dbAll} = require('../models/dbConnect')
const redis = require('../redis/redisClient')
redis.pubConnection()

const getConfig = async (protocolName, id) => {
    const getDeviceQuery = `SELECT DEVICE.*, 
        ${protocolName}.*,
        GROUP_CONCAT(
        ${protocolName}_TAG.name || ',' || ${protocolName}_TAG.address || ',' || ${protocolName}_TAG.unit || ',' || 
        ${protocolName}_TAG.dataType || ',' || ${protocolName}_TAG.PF || ',' || ${protocolName}_TAG.size , ';'
        ) AS tagInfo
    FROM DEVICE 
        JOIN ${protocolName} ON DEVICE.ID = ${protocolName}.deviceID
        JOIN TAG ON TAG.deviceID = DEVICE.ID 
        JOIN ${protocolName}_TAG ON ${protocolName}_TAG.deviceID = TAG.deviceID AND ${protocolName}_TAG.name = TAG.name
    WHERE DEVICE.ID = ?`
    try {
        const configInfo = await dbAll(getDeviceQuery, id)  
        if (configInfo[0].deviceID !== null) {
            const tagInfo = []
            const deviceConfig = []

            deviceConfig.push({
                ID: configInfo[0].ID,
                name: configInfo[0].name,
                byteOrder: configInfo[0].byteOrder,
                wordOrder: configInfo[0].wordOrder,
                scanningCycle: configInfo[0].scanningCycle,
                minRespTime: configInfo[0].minRespTime,
                slaveid: configInfo[0].slaveid,
                options: {
                    host: configInfo[0].ip,
                    port: configInfo[0].port,
                },
            })

            configInfo[0].tagInfo.split(';').forEach((item) => {
                const tagValue = item.split(',')
                tagInfo.push({
                    name: tagValue[0],
                    address: Number(tagValue[1]),
                    unit: tagValue[2],
                    dataType: tagValue[3],
                    PF: Number(tagValue[4]),
                    size: Number(tagValue[5]),
                })
            })

            return [{deviceConfig, tagInfo}]
        } else {
            return []
        }
    } catch (err) {
        redis.pub2Redis('log', {serviceName: 'ModbusTCP', level: 'error', errMsg: err})
        console.log(err)
        return []
    }
}

module.exports = getConfig
