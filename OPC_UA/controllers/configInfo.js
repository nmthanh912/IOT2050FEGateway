const {dbAll} = require('../models/dbConnect')

const getConfig = async (protocolName, id) => {
    const getDeviceQuery = `SELECT DEVICE.*, 
        OPC_UA.url,
        GROUP_CONCAT(
        OPC_UA_TAG.name || ',' || OPC_UA_TAG.nodeid || ',' || OPC_UA_TAG.unit , ':'
        ) as nodeInfo
    FROM DEVICE 
        JOIN OPC_UA ON DEVICE.ID = OPC_UA.deviceID
        JOIN TAG ON TAG.deviceID = DEVICE.ID 
        JOIN OPC_UA_TAG ON OPC_UA_TAG.deviceID = TAG.deviceID AND OPC_UA_TAG.name = TAG.name
    WHERE DEVICE.ID = ?`
    try {
        const configInfo = await dbAll(getDeviceQuery, id)

        if (configInfo[0].deviceID !== null) {
            const nodeInfo = []
            const deviceConfig = []

            deviceConfig.push({
                ID: configInfo[0].ID,
                name: configInfo[0].name,
                scanningCycle: configInfo[0].scanningCycle,
                minRespTime: configInfo[0].minRespTime,
                url: configInfo[0].url,
            })

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
        console.log(err)
        return []
    }
}

module.exports = getConfig
