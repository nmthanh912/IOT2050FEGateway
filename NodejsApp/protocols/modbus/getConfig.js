const {dbAll} = require('../../models/database')

const getConfig = async (protocolName) => {
    const getDeviceQuery = `SELECT DEVICE.ID as deviceID, DEVICE.name as deviceName, 
        ${protocolName}.*,
        GROUP_CONCAT(
        SUBSCRIBES.tagName || ',' || ${protocolName}_TAG.address || ',' || ${protocolName}_TAG.unit, ';'
        ) as tagInfo, 
        MQTT_CLIENT.IP as mqttIP, MQTT_CLIENT.port as mqttPort, MQTT_CLIENT.username as mqttUsername, MQTT_CLIENT.password as mqttPassword
    FROM DEVICE 
        JOIN ${protocolName} ON DEVICE.ID = ${protocolName}.deviceID
        JOIN SUBSCRIBES ON ${protocolName}_TAG.deviceID = SUBSCRIBES.deviceID AND ${protocolName}_TAG.name = SUBSCRIBES.tagName
        JOIN ${protocolName}_TAG ON DEVICE.ID = ${protocolName}_TAG.deviceID
        JOIN MQTT_CLIENT ON MQTT_CLIENT.ID = SUBSCRIBES.gatewayID 
    GROUP BY DEVICE.ID`
    try {
        const configInfos = await dbAll(getDeviceQuery, [])

        if (configInfos.length > 0) {
            configInfos.forEach((config, index) => {
                const tags = []

                config.tagInfo.split(';').forEach((item) => {
                    let temp = item.split(',')
                    tags.push({
                        name: temp[0],
                        address: temp[1],
                        unit: temp[2],
                    })
                })

                configInfos[index].tagInfo = tags
            })
        }

        return configInfos
    } catch (err) {
        console.log(err)
        return []
    }
}

module.exports = getConfig
