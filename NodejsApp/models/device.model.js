
const { dbAll, dbRun } = require("./database")
const { JSON_PATH } = require("../constants/paths")

const fs = require("fs")
const util = require("util");
const { protocolTypes } = require("../constants/protocolTypes");

const unlink = util.promisify(fs.unlink.bind(fs));

const createInsertTagSQL = (numOfTags, protocolName) => {
    let numOfTagAttributes = 0

    if (protocolName === protocolTypes.MODBURTU || protocolName === protocolTypes.MODBUSTCP) {
        numOfTagAttributes = 7
    } else if (protocolName === protocolTypes.OPC_UA) {
        numOfTagAttributes = 4
    }

    const tagValueBracket = "(?,?)"
    // Generate "(?, ?, ... ?)""
    const protocolTagValueBracket = "(" + ",?".repeat(numOfTagAttributes).slice(1) + ")"

    // 
    const insertTagSQL = "INSERT INTO TAG VALUES " +
        (tagValueBracket + ", ").repeat(numOfTags).slice(0, -2);
    const insertProtocolTagSQL = `INSERT INTO ${protocolName}_TAG VALUES ` +
        (protocolTagValueBracket + ", ").repeat(numOfTags).slice(0, -2)

    return { insertTagSQL, insertProtocolTagSQL }
}

const deviceModel = {
    getAll: async function () {
        return await dbAll("SELECT * FROM DEVICE", []);
    },

    update: async function (deviceID, deviceData, deviceConfig, tagList, protocolName) {
        try {
            await dbRun("BEGIN TRANSACTION")
            const updateDeviceSQL = `
                UPDATE DEVICE 
                SET 
                    name = ?,
                    description = ?,
                    byteOrder = ?,
                    wordOrder = ?,
                    scanningCycle = ?,
                    minRespTime = ?
                WHERE ID = ?
            `
            let updateDeviceProtocolSQL = ''
            let updateDeviceProtocolQueryParams = []
            if (protocolName === protocolTypes.MODBUSTCP) {
                updateDeviceProtocolSQL = `
                    UPDATE MODBUSTCP
                    SET
                        IP = ?,
                        port = ?,
                        slaveid = ?
                    WHERE deviceID = ?
                `
                updateDeviceProtocolQueryParams.push(...[
                    deviceConfig.ip,
                    deviceConfig.port,
                    deviceConfig.slaveid,
                    deviceID
                ])
            } else if (protocolName === protocolTypes.MODBURTU) {
                updateDeviceProtocolSQL = `
                    UPDATE MODBUSRTU
                    SET
                        com_port_num = ?,
                        parity = ?,
                        slaveid = ?,
                        baudrate = ?,
                        stopbits = ?,
                        databits = ?
                    WHERE deviceID = ?
                `
                updateDeviceProtocolQueryParams.push(...[
                    deviceConfig.com_port_num,
                    deviceConfig.parity,
                    deviceConfig.slaveid,
                    deviceConfig.baudrate,
                    deviceConfig.stopbits,
                    deviceConfig.databits,
                    deviceID
                ])
            } else if (protocolName === protocolTypes.OPC_UA) {
                updateDeviceProtocolSQL = `
                    UPDATE OPC_UA
                    SET
                        url = ?
                    WHERE deviceID = ?
                `
                updateDeviceProtocolQueryParams.push(...[
                    deviceConfig.url,
                    deviceID
                ])
            }

            await dbRun(updateDeviceSQL, [
                deviceData.name,
                deviceData.description,
                deviceData.byteOrder,
                deviceData.wordOrder,
                deviceData.scanningCycle,
                deviceData.minRespTime,
                deviceID
            ])

            await dbRun(updateDeviceProtocolSQL, updateDeviceProtocolQueryParams)

            if (tagList.length !== 0 && tagList[0].name !== "") {
                const { insertTagSQL, insertProtocolTagSQL } = createInsertTagSQL(
                    tagList.length, 
                    protocolName
                )

                await dbRun(`DELETE FROM TAG WHERE deviceID = ?`, deviceID);

                const insertTagParams = tagList.map(tag => [deviceID, tag.name]).flat()
                
                await dbRun(insertTagSQL, insertTagParams)

                let insertProtocolTagParams = []
                if (protocolName === protocolTypes.MODBURTU || protocolName === protocolTypes.MODBUSTCP) {
                    insertProtocolTagParams = tagList.map(tag => [
                        tag.name, tag.address, tag.unit,
                        tag.dataType, tag.PF, tag.size,
                        deviceID
                    ]).flat()
                } else if (protocolName === protocolTypes.OPC_UA) {
                    insertProtocolTagParams = tagList.map(tag => [
                        tag.name,
                        tag.nodeid,
                        tag.unit,
                        deviceID
                    ])
                }
                console.log(insertProtocolTagParams)
                console.log(insertProtocolTagSQL)
                await dbRun(insertProtocolTagSQL, insertProtocolTagParams)
                await dbRun("COMMIT")
            }
        } catch (err) {
            await dbRun("ROLLBACK TRANSACTION")
            throw err
        }
    },

    getConfig: async function (deviceID, protocolName) {
        return dbAll(`
            SELECT * FROM ${protocolName} 
            WHERE ${protocolName}.deviceID = ?
        `, [deviceID]);
    },

    drop: async function (deviceID) {
        try {
            await dbRun("BEGIN TRANSACTION")
            await dbRun("DELETE FROM DEVICE WHERE ID = ?", [deviceID]);

            const files = fs
                .readdirSync(JSON_PATH)
                .filter(filename => filename.slice(9, 17) === deviceID);
            const unlinkPromises = files.map(file => unlink(JSON_PATH + "/" + file));

            await Promise.allSettled(unlinkPromises);
            await dbRun("COMMIT")
        } catch (err) {
            await dbRun("ROLLBACK TRANSACTION")
            throw err;
        }
    }
}

module.exports = deviceModel