const { INCORRECT_PROTOCOL_MESSAGE } = require("../constants/error")
const { protocolTypes } = require("../constants/protocolTypes")

const NUM_OF_MODBUS_TAG_ATTRIBUTES = 7
const NUM_OF_OPC_UA_TAG_ATTRIBUTES = 4

const generateInsertTagSQL = (numOfTags, protocolName) => {
    let numOfTagAttributes = 0

    if (protocolName === protocolTypes.MODBURTU || protocolName === protocolTypes.MODBUSTCP) {
        numOfTagAttributes = NUM_OF_MODBUS_TAG_ATTRIBUTES
    } else if (protocolName === protocolTypes.OPC_UA) {
        numOfTagAttributes = NUM_OF_OPC_UA_TAG_ATTRIBUTES
    } else {
        throw new Error(INCORRECT_PROTOCOL_MESSAGE)
    }

    const tagValueBracket = "(?,?)"
    // Generate "(?, ?, ... ?)""
    const protocolTagValueBracket = "(" + ",?".repeat(numOfTagAttributes).slice(1) + ")"

    const insertTagSQL = "INSERT INTO TAG VALUES " +
        (tagValueBracket + ", ").repeat(numOfTags).slice(0, -2);
    const insertProtocolTagSQL = `INSERT INTO ${protocolName}_TAG VALUES ` +
        (protocolTagValueBracket + ", ").repeat(numOfTags).slice(0, -2)

    return { insertTagSQL, insertProtocolTagSQL }
}

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
    // must replace
    generateInsertTagSQL,
    // must replace
    generateInsertDeviceConfigSQL,
    generateInsertProtocolTagSQL
}