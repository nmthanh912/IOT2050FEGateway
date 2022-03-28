const {dbAll} = require('./dbConnect')

const getConfig = async (protocolName, id) => {
    const getDeviceQuery = `SELECT DEVICE.ID as deviceID, DEVICE.name as deviceName, 
        ${protocolName}.*,
        GROUP_CONCAT(
        ${protocolName}_TAG.name || ',' || ${protocolName}_TAG.address || ',' || ${protocolName}_TAG.unit || ',' || 
        ${protocolName}_TAG.dataType || ',' || ${protocolName}_TAG.PF || ',' || ${protocolName}_TAG.size , ';'
        ) as tagInfo
    FROM DEVICE 
        JOIN ${protocolName} ON DEVICE.ID = ${protocolName}.deviceID
        JOIN TAG ON TAG.deviceID = DEVICE.ID 
        JOIN ${protocolName}_TAG ON ${protocolName}_TAG.deviceID = TAG.deviceID AND ${protocolName}_TAG.name = TAG.name
    WHERE DEVICE.ID = ?`
    try {
        const configInfo = await dbAll(getDeviceQuery, id)

        if (configInfo[0].deviceID !== null) {
            const tags = []
            configInfo[0].tagInfo.split(';').forEach((item) => {
                let temp = item.split(',')
                tags.push({
                    name: temp[0],
                    address: temp[1],
                    unit: temp[2],
                })
            })
            configInfo[0].tagInfo = tags
            return configInfo
        } else {
            return []
        }
    } catch (err) {
        console.log(err)
        return []
    }
}

module.exports = getConfig
