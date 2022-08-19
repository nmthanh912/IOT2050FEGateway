require("dotenv").config()
const { INCORRECT_PROTOCOL_MESSAGE } = require("../constants/error")
const { gatewayProtocolTypes } = require("../constants/protocolTypes")
const { dbRun, dbAll } = require("./database")
const fs = require("fs/promises")

const JSON_PATH = process.env.CUSTOM_JSON_PATH

const gatewayModel = {
    create: async function (gatewayData, protocolName) {
        if (protocolName !== gatewayProtocolTypes.MQTT_CLIENT) {
            throw new Error(INCORRECT_PROTOCOL_MESSAGE)
        }
        return dbRun(`INSERT INTO ${protocolName} (
            ID, description, name,
            username, password, 
            IP, port, QoS
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
            gatewayData.ID, gatewayData.description,
            gatewayData.name, gatewayData.username,
            gatewayData.password, gatewayData.IP,
            gatewayData.port, gatewayData.QoS
        ])
    },

    getAll: async function () {
        return dbAll(`SELECT * FROM mqtt_client`);
    },

    update: async function (gatewayId, gatewayData, protocolName) {
        return dbRun(`UPDATE ${protocolName}
            SET 
                description = ?,
                name = ?,
                username = ?,
                password = ?,
                IP = ?,
                port = ?,
                QoS = ?
            WHERE ID = ?
        `, [
            gatewayData.description, gatewayData.name, gatewayData.username,
            gatewayData.password, gatewayData.IP, gatewayData.port,
            gatewayData.QoS, gatewayId
        ])
    },

    delete: async function (gatewayId) {
        console.log(gatewayId)

        try {
            await dbRun(`BEGIN TRANSACTION`)
            console.log(gatewayId)
            await dbRun(`DELETE FROM mqtt_client WHERE ID = ?`, [gatewayId])

            const allFiles = await fs.readdir(JSON_PATH)
            const files = allFiles.filter(fn => fn.slice(0, 8) === gatewayId)
            const unlinkPromises = files.map(file => unlink(JSON_PATH + '/' + file))
            await Promise.allSettled(unlinkPromises)

            await dbRun(`COMMIT`)
        } catch (err) {
            await dbRun(`ROLLBACK TRANSACTION`)
            throw err
        }
    },

    getSubscribedDevices: async function (gatewayId) {
        return dbAll(`SELECT DEVICE.ID, DEVICE.name, DEVICE.protocolType as protocol
            FROM DEVICE JOIN SUBSCRIBES ON DEVICE.ID = SUBSCRIBES.deviceID
            WHERE SUBSCRIBES.gatewayID = ?
            GROUP BY DEVICE.ID
            ORDER BY DEVICE.name ASC
        `, [gatewayId])
    },

    addSubscribeDevices: async function (gatewayId, deviceIdList) {
        try {
            await dbRun("BEGIN TRANSACTION")
            for (let deviceId of deviceIdList) {
                await dbRun(`INSERT INTO subscribes VALUES (?, ?, ?)`, [gatewayId, deviceId, null])
                await dbRun(`INSERT OR IGNORE INTO configs VALUES (?, ?, ?)`, [gatewayId, deviceId, 0])
            }
            await dbRun("COMMIT")
        } catch (err) {
            await dbRun("ROLLBACK TRANSACTION")
            throw err
        }
    },

    removeSubscribedDevice: async function (gatewayId, deviceId) {
        try {
            await dbRun(`BEGIN TRANSACTION`)

            await dbRun(`DELETE FROM subscribes WHERE gatewayID = ? AND deviceID = ?`, [gatewayId, deviceId])
            await dbRun(`DELETE FROM configs WHERE gatewayID = ? AND deviceID = ?`, [gatewayId, deviceId])

            await fs.unlink(`${JSON_PATH}/${gatewayId}_${deviceId}.json`)

            await dbRun("COMMIT")
        } catch (err) {
            // Check if error is cause by unlink function (file does not exists)
            if (err.errno === -2 && err.code === 'ENOENT' && err.syscall === 'unlink')
                await dbRun("COMMIT")
            else {
                await dbRun("ROLLBACK TRANSACTION")
                throw err
            }
        }
    },

    getSubcribedDeviceConfig: async function (gatewayId, deviceId, deviceProtocol) {
        const tagConfigList = await dbAll(`
            SELECT name, gatewayID
            FROM ${deviceProtocol}_TAG LEFT JOIN SUBSCRIBES
                ON (
                    ${deviceProtocol}_TAG.name = SUBSCRIBES.tagName
                    AND ${deviceProtocol}_TAG.deviceID = SUBSCRIBES.deviceID
                    AND SUBSCRIBES.gatewayID = ?
                )
            WHERE ${deviceProtocol}_TAG.deviceID = ?`,
            [gatewayId, deviceId]
        )
        const subscribedList = tagConfigList.map(tagConfig => {
            let subscribe = tagConfig.gatewayID !== null
            delete tagConfig.gatewayID
            return { subscribe, ...tagConfig }
        })

        const useCustom = await dbAll(
            `SELECT toggle FROM configs WHERE gatewayID = ? AND deviceID = ?`,
            [gatewayId, deviceId]
        )

        let customJsonCode = null
        try {
            customJsonCode = await fs.readFile(`${JSON_PATH}/${gatewayId}_${deviceId}.json`, 'utf-8')
        } catch (error) {
            // if file has not been created
            customJsonCode = null
        }

        return {
            tagList: subscribedList,
            code: customJsonCode,
            toggle: useCustom[0].toggle
        }
    },

    updateSubcribedDeviceConfig: async function (gatewayId, deviceId, config) {
        const { code, tagList, toggle } = config
        try {
            await dbRun("BEGIN TRANSACTION")

            await dbRun(
                `UPDATE configs SET toggle = ? WHERE gatewayID = ? AND deviceID = ?`,
                [toggle, gatewayId, deviceId]
            )

            const customJsonCode = code.slice(code.indexOf('{'))
            await fs.writeFile(
                `${JSON_PATH}/${gatewayId}_${deviceId}.json`,
                customJsonCode,
                { encoding: "utf-8" }
            )

            await dbRun(`DELETE FROM subscribes WHERE
                gatewayID = ?
                AND deviceID = ?
            `, [gatewayId, deviceId])

            if (tagList.length > 0) {
                for (let tag of tagList) {
                    await dbRun("INSERT INTO subscribes VALUES (?, ?, ?)", [gatewayId, deviceId, tag.name])
                }
            } else {
                await dbRun('INSERT INTO subscribes VALUES (?, ?, ?)', [gatewayId, deviceId, null])
            }
            await dbRun("COMMIT")
        }
        catch (err) {
            await dbRun(`ROLLBACK TRANSACTION`)
            throw err
        }
    }
}

module.exports = gatewayModel