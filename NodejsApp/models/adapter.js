const { INCORRECT_PROTOCOL_MESSAGE } = require("../constants/error")
const { protocolTypes } = require("../constants/protocolTypes")

const convertDeviceConfigToQueryParams = (deviceConfig, protocolName) => {
    if (protocolName === protocolTypes.MODBURTU) {
        return [
            deviceConfig.com_port_num,
            deviceConfig.parity,
            deviceConfig.slaveid,
            deviceConfig.baudrate,
            deviceConfig.stopbits,
            deviceConfig.databits,
        ]
    } else if (protocolName === protocolTypes.MODBUSTCP) {
        return [
            deviceConfig.ip,
            deviceConfig.port,
            deviceConfig.slaveid
        ]
    } else if (protocolName === protocolTypes.OPC_UA) {
        return [deviceConfig.url]
    }

    throw new Error(INCORRECT_PROTOCOL_MESSAGE)
}

const convertDeviceDataToQueryParams = (deviceData) => {
    return [
        deviceData.name,
        deviceData.description,
        deviceData.byteOrder,
        deviceData.wordOrder,
        deviceData.scanningCycle,
        deviceData.minRespTime,
    ]
}

const convertTagToProtocolParams = (deviceID, tag, protocolName) => {
    if (protocolName === protocolTypes.MODBURTU || protocolName === protocolTypes.MODBUSTCP) {
        return [
            tag.name, tag.address, tag.unit,
            tag.dataType, tag.PF, tag.size,
            deviceID
        ]
    } else if (protocolName === protocolTypes.OPC_UA) {
        return [
            tag.name,
            tag.nodeid,
            tag.unit,
            deviceID
        ]
    }
    throw new Error("Incorrect protocol type !")
}

module.exports = {
    convertDeviceConfigToQueryParams,
    convertDeviceDataToQueryParams,
    convertTagToProtocolParams
}