const {dbAll} = require('../models/dbConnect')

const getConfig = async (id) => {
    const getInfoQuery = `SELECT MQTT_CLIENT.*, 
    GROUP_CONCAT(SUBSCRIBES.tagName) AS tagName, DEVICE.name AS deviceName
    FROM MQTT_CLIENT 
        JOIN SUBSCRIBES ON MQTT_CLIENT.ID = SUBSCRIBES.gatewayID 
        JOIN TAG ON TAG.deviceID = SUBSCRIBES.deviceID AND TAG.name = SUBSCRIBES.tagName
        JOIN DEVICE ON DEVICE.ID = TAG.deviceID
    WHERE MQTT_CLIENT.ID = ?
    GROUP BY DEVICE.name
    `
    try {
        const configInfo = await dbAll(getInfoQuery, id)
        const mqttConfig = []
        const listSub = []

        if (configInfo.length > 0) {
            configInfo.forEach((config) => {
                listSub.push({
                    deviceName: config.deviceName,
                    tagNameList: config.tagName.split(','),
                })
            })

            delete configInfo[0].tagName
            delete configInfo[0].deviceName
            mqttConfig.push(configInfo[0])

            return [{mqttConfig, listSub}]
        }
        return []
    } catch (err) {
        console.log('Get config info errror!', err)
        return []
    }
}

module.exports = getConfig
