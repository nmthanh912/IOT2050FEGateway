const {dbAll} = require('../Models/dbConnect')

const getConfig = async (protocolName, id) => {
    const getDeviceQuery = `SELECT DEVICE.*, 
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
                const tagValue = item.split(',')
                tags.push({
                    name: tagValue[0],
                    address: tagValue[1],
                    unit: tagValue[2],
                    dataType: tagValue[3],
                    PF: tagValue[4],
                    size: tagValue[5],
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
