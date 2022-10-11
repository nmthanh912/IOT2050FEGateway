const { dbAll } = require('../models/dbConnect')

const removeAccents = require('../utils/removeAccents')
const pubRedis = require('../redis/pubRedisClient')

const getConfig = async (id) => {
    const getInfoQuery = `SELECT MQTT_CLIENT.*, 
        GROUP_CONCAT(SUBSCRIBES.tagName) AS tagName, DEVICE.name AS deviceName, 
        DEVICE.ID AS deviceID, CONFIGS.toggle AS onCustomMode
        FROM MQTT_CLIENT 
            JOIN SUBSCRIBES ON MQTT_CLIENT.ID = SUBSCRIBES.gatewayID 
            LEFT JOIN TAG ON TAG.deviceID = SUBSCRIBES.deviceID AND TAG.name = SUBSCRIBES.tagName
            JOIN DEVICE ON DEVICE.ID = SUBSCRIBES.deviceID
            JOIN CONFIGS ON CONFIGS.gatewayID = MQTT_CLIENT.ID AND CONFIGS.deviceID = DEVICE.ID
        WHERE MQTT_CLIENT.ID = ?
        GROUP BY DEVICE.name
    `
    try {
        const configInfo = await dbAll(getInfoQuery, id)
        const mqttConfig = []
        const listDeviceSub = []

        if (configInfo.length > 0) {
            configInfo.forEach((config) => {
                listDeviceSub.push({
                    deviceNameModified: removeAccents(config.deviceName),
                    deviceName: config.deviceName,
                    deviceID: config.deviceID,
                    listTagSub: config.tagName ? config.tagName.split(',') : [],
                    mqttID: config.ID,
                    onCustomMode: config.onCustomMode,
                })
            })


            delete configInfo[0].tagName
            delete configInfo[0].deviceName
            delete configInfo[0].deviceID
            delete configInfo[0].onCustomMode
            mqttConfig.push(configInfo[0])

            return [{ mqttConfig, listDeviceSub }]
        }
        return []
    } catch (err) {
        pubRedis.pub2Redis('log', { serviceName: 'MQTTClient', level: 'error', errMsg: err })
        console.log('Get config info errror!', err)
        return []
    }
}

module.exports = getConfig
