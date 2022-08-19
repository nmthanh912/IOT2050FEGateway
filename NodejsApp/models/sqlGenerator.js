const { INCORRECT_PROTOCOL_MESSAGE } = require("../constants/error")
const { protocolTypes } = require("../constants/protocolTypes")

const generateInsertDeviceConfigSQL = (protocolName) => {
    if (protocolName === protocolTypes.MODBUSTCP) {
        return `INSERT INTO ${protocolName} (ip, port, slaveid, deviceID) VALUES (?, ?, ? ,?)`
    } else if (protocolName == protocolTypes.MODBURTU) {
        return `INSERT INTO ${protocolName} 
            (com_port_num, parity, slaveid, baudrate, stopbits, databits, deviceID) 
            VALUES (?, ?, ? ,?, ?, ?, ?)`
    }
    else if (protocolName === protocolTypes.OPC_UA) {
        return `INSERT INTO ${protocolName} (url, deviceID) VALUES (?, ?)`
    }
    throw new Error(INCORRECT_PROTOCOL_MESSAGE)
}

const generateInsertProtocolTagSQL = (protocolName) => {
    if (protocolName === protocolTypes.MODBURTU || protocolName === protocolTypes.MODBUSTCP) {
        return `INSERT INTO ${protocolName}_TAG (
            name, address, unit,
            dataType, PF, size, deviceID
        ) VALUES (?, ?, ?, ? ,? ,?, ?)`
    } else if(protocolTypes === protocolTypes.OPC_UA) {
        return `INSERT INTO ${protocolName}_TAG (
            name, nodeid, unit, deviceID
        ) VALUES (?, ?, ?, ?)`
    }
    throw new Error(INCORRECT_PROTOCOL_MESSAGE)
}

module.exports = {
    generateInsertDeviceConfigSQL,
    generateInsertProtocolTagSQL
}