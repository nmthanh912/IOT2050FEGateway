
const { dbAll, dbRun } = require("./database")
const { JSON_PATH } = require("../constants/paths")

const fs = require("fs")
const util = require("util");
const unlink = util.promisify(fs.unlink.bind(fs));

const { generateInsertDeviceConfigSQL, generateInsertProtocolTagSQL, generateUpdateDeviceConfigSQL } = require("./sqlGenerator");
const { convertDeviceConfigToQueryParams, convertDeviceDataToQueryParams, convertTagToProtocolParams } = require("./adapter");
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
        insertDeviceParams.unshift(deviceID)
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

            for (tag of tagList) {
                await dbRun(`INSERT INTO TAG VALUES (?, ?)`, [deviceID, tag.name])
                await dbRun(
                    generateInsertProtocolTagSQL(protocolName),
                    convertTagToProtocolParams(deviceID, tag, protocolName)
                )
            }

            await dbRun("COMMIT")
            return [deviceID]
        } catch (err) {
            await dbRun("ROLLBACK TRANSACTION")
            throw err
        }
    },

    /** This function does the following steps
     * 1. Create new device (in DEVICE table)
     * 2. Create config of device (in @param {*} protocolName table) 
     * 3. If fully update (request body include tag),
     * 		3.1. Delete all tag of device
     * 		3.2. Insert all tag to TAG tables
     * 		3.3. Insert all tag info to "@param {*} protocolName"_"TAG" table
     * 4. If done replicate number loop times, terminate, otherwise back to step 1 
     */
    createMany: async function (deviceData, deviceConfig, tagList, replicateNumber, protocolName) {
        const insertDeviceParams = convertDeviceDataToQueryParams(deviceData)
        insertDeviceParams.push(protocolName)

        const insertDeviceConfigParams = convertDeviceConfigToQueryParams(deviceConfig, protocolName)

        const keyList = []
        const deviceName = deviceData.name
        try {
            await dbRun("BEGIN TRANSACTION")

            for (let i = 0; i < replicateNumber; ++i) {
                const deviceID = uniqueId()
                insertDeviceParams.unshift(deviceID)
                // Convert name of device by concat serial after name
                insertDeviceParams[1] = deviceName + "_" + (i + 1).toString()

                insertDeviceConfigParams.push(deviceID)
                await dbRun(`
                    INSERT INTO device (
                        ID, name, description, byteOrder, 
                        wordOrder, scanningCycle, minRespTime,
                        protocolType
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    insertDeviceParams
                );
                await dbRun(generateInsertDeviceConfigSQL(protocolName), insertDeviceConfigParams)

                for (tag of tagList) {
                    await dbRun(`INSERT INTO TAG VALUES (?, ?)`, [deviceID, tag.name])
                    await dbRun(
                        generateInsertProtocolTagSQL(protocolName),
                        convertTagToProtocolParams(deviceID, tag, protocolName)
                    )
                }
                insertDeviceParams.shift()
                insertDeviceConfigParams.pop()
                keyList.push(deviceID)
            }

            await dbRun("COMMIT")
            return keyList
        } catch (err) {
            await dbRun("ROLLBACK TRANSACTION")
            throw err
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
            const updateDeviceParams = convertDeviceDataToQueryParams(deviceData)
            updateDeviceParams.push(deviceID)
            await dbRun(
                updateDeviceSQL,
                updateDeviceParams
            )

            // 2. Update config of device (in ${protocolName} table) 
            let updateDeviceProtocolSQL = generateUpdateDeviceConfigSQL(protocolName)
            const updateDeviceProtocolQueryParams = convertDeviceConfigToQueryParams(
                deviceConfig,
                protocolName
            )
            updateDeviceProtocolQueryParams.push(deviceID)
            await dbRun(updateDeviceProtocolSQL, updateDeviceProtocolQueryParams)
            
            if (tagList.length !== 0 && tagList[0].name !== "") {
                const gatewayList = await dbAll("SELECT DISTINCT gatewayID FROM subscribes WHERE deviceID = ?", deviceID)

                // 3.1. Delete all tag of device
                await dbRun(`DELETE FROM TAG WHERE deviceID = ?`, deviceID);

                const insertProtocolTagSQL = generateInsertProtocolTagSQL(protocolName)
                for(let tag of tagList) {
                    // 3.2. Insert all tag to TAG tables
                    await dbRun(`INSERT INTO tag VALUES (?, ?)`, [deviceID, tag.name])

                    // 3.3. Insert all tag info to ${protocolName}_"TAG" table
                    await dbRun(insertProtocolTagSQL, convertTagToProtocolParams(
                        deviceID,
                        tag,
                        protocolName
                    ))
                }
                for(let gateway of gatewayList) {
                    await dbRun(`INSERT INTO subscribes VALUES (?, ?, ?)`, [gateway.gatewayID, deviceID, null])
                }
            }
            await dbRun("COMMIT")
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