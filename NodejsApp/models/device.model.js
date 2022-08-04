
const { dbAll, dbRun } = require("./database")
const { JSON_PATH } = require("../constants/paths")
const { protocolTypes } = require("../constants/protocolTypes");

const fs = require("fs")
const util = require("util");
const unlink = util.promisify(fs.unlink.bind(fs));

const { generateInsertTagSQL, generateInsertDeviceConfigSQL } = require("./sqlGenerator");
const { convertDeviceConfigToQueryParams, convertDeviceDataToQueryParams, convertTagListToParams, convertTagListToProtocolParams } = require("./adapter");
const { uniqueId } = require("../utils");

const deviceModel = {
    getAll: async function () {
        return await dbAll("SELECT * FROM DEVICE");
    },

    /** This function does the following steps
     * 1. Create new device (in DEVICE table)
     * 2. Create config of device (in @param {*} protocolName table) 
     * 3. If fully update (request body include tag),
     * 		3.1. Delete all tag of device
     * 		3.2. Insert all tag to TAG tables
     * 		3.3. Insert all tag info to "@param {*} protocolName"_"TAG" table
     */

    createOne: async function (deviceData, deviceConfig, tagList, protocolName) {
        const deviceID = uniqueId()

        const insertDeviceParams = convertDeviceDataToQueryParams(deviceData)
        insertDeviceParams.shift(deviceID)
        insertDeviceParams.push(protocolName)

        const insertDeviceConfigParams = convertDeviceConfigToQueryParams(deviceConfig, protocolName)
        insertDeviceConfigParams.push(deviceID)

        try {
            await dbRun("BEGIN TRANSACTION")

            await dbRun(`INSERT INTO device (
                    ID, name, description, byteOrder, 
                    wordOrder, scanningCycle, minRespTime,
                    protocolType
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                insertDeviceParams
            );

            await dbRun(generateInsertDeviceConfigSQL(protocolName), insertDeviceConfigParams)
            
            for(tag of tagList) {
                await dbRun(`INSERT INTO TAG VALUES (?, ?)`, [deviceID, tag.name])
                // Must refactor
                // await dbRun(`INSERT INTO ${protocolName}_TAG `)
            }

            await dbRun("COMMIT")
        } catch (err) {
            console.log(err)
            await dbRun("ROLLBACK TRANSACTION")
        }
    },

    /** This function does the following steps
     * 1. Update data of device (in DEVICE table)
     * 2. Update config of device (in @param {*} protocolName table) 
     * 3. If fully update (request body include tag),
     * 		3.1. Delete all tag of device
     * 		3.2. Insert all tag to TAG tables
     * 		3.3. Insert all tag info to "@param {*} protocolName"_"TAG" table
     */
    update: async function (deviceID, deviceData, deviceConfig, tagList, protocolName) {
        try {
            await dbRun("BEGIN TRANSACTION")
            // 1. Update data of device (in DEVICE table)
            const updateDeviceSQL = ` UPDATE DEVICE SET name = ?, description = ?, 
                byteOrder = ?, wordOrder = ?, scanningCycle = ?, minRespTime = ?
                WHERE ID = ?`
            const updateDeviceParams = convertDeviceDataToQueryParams(deviceConfig)
            updateDeviceParams.push(deviceID)
            await dbRun(
                updateDeviceSQL,
                updateDeviceParams
            )

            // 2. Update config of device (in @param {*} protocolName table) 
            let updateDeviceProtocolSQL = ''
            if (protocolName === protocolTypes.MODBUSTCP) {
                updateDeviceProtocolSQL = `UPDATE MODBUSTCP SET IP = ?, port = ?, slaveid = ? WHERE deviceID = ?`
            } else if (protocolName === protocolTypes.MODBURTU) {
                updateDeviceProtocolSQL = `UPDATE MODBUSRTU SET com_port_num = ?, parity = ?,
                    slaveid = ?, baudrate = ?, stopbits = ?, databits = ?
                    WHERE deviceID = ?`
            } else if (protocolName === protocolTypes.OPC_UA) {
                updateDeviceProtocolSQL = ` OPC_UA SET url = ? WHERE deviceID = ?`
            }
            const updateDeviceProtocolQueryParams = convertDeviceConfigToQueryParams(
                deviceConfig,
                protocolName
            )
            updateDeviceProtocolQueryParams.push(deviceID)
            await dbRun(updateDeviceProtocolSQL, updateDeviceProtocolQueryParams)

            if (tagList.length !== 0 && tagList[0].name !== "") {
                // 3.1. Delete all tag of device
                await dbRun(`DELETE FROM TAG WHERE deviceID = ?`, deviceID);

                const { insertTagSQL, insertProtocolTagSQL } = generateInsertTagSQL(
                    tagList.length,
                    protocolName
                )

                // 3.2. Insert all tag to TAG tables
                await dbRun(insertTagSQL, convertTagListToParams(deviceID, tagList))

                // 3.3. Insert all tag info to "@param {*} protocolName"_"TAG" table
                await dbRun(insertProtocolTagSQL, convertTagListToProtocolParams(
                    deviceID,
                    tagList,
                    protocolName
                ))
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