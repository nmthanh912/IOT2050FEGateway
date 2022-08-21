const { convertTagToProtocolParams } = require("./adapter")
const { dbAll, dbRun } = require("./database")
const { generateInsertProtocolTagSQL } = require("./sqlGenerator")

const tagModel = {
    getAll: async function (deviceId, protocolName) {
        const tags = await dbAll(`
            SELECT * FROM ${protocolName}_TAG 
            WHERE deviceID = ? ORDER BY address ASC
        `, [deviceId])

        if (tags.length === 0) {
            const tagTableSchema = await dbAll(`PRAGMA table_info (${protocolName}_TAG)`)
            const sampleEmptyTag = {}

            tagTableSchema.forEach(row => {
                let key = row.name
                sampleEmptyTag[key] = ''
            })

            tags.push(sampleEmptyTag)
        }
        tags.forEach(tag => delete tag.deviceID)
        return tags
    },

    editAttribute: async function (deviceId, protocolName, tagName, attrNameInTag, newValue) {
        const query = attrNameInTag === 'name' ? {
            SQL: `UPDATE TAG SET ${attrNameInTag} = ? WHERE deviceID = ? AND name = ?`,
            params: [newValue, deviceId, tagName]
        } : {
            SQL: `UPDATE ${protocolName}_TAG SET ${attrNameInTag} = ? WHERE deviceID = ? AND name = ?`,
            params: [newValue, deviceId, tagName]
        }
        return dbRun(query.SQL, query.params)
    },
    delete: async function (deviceId, tagName) {
        return dbRun(`DELETE FROM TAG WHERE deviceID = ? AND name = ?`, [deviceId, tagName])
    },
    add: async function (deviceId, protocolName, tag) {
        const insertProtocolTagSQL = generateInsertProtocolTagSQL(protocolName)
        const insertProtocolTagParams = convertTagToProtocolParams(deviceId, tag, protocolName)

        const insertTagSQL = "INSERT INTO TAG (deviceID, name) VALUES (?, ?)"
        const insertTagParams = [
            deviceId,

            // Tag's name
            insertProtocolTagParams[0]
        ]
        await dbRun("BEGIN TRANSACTION")
        try {
            await dbRun(insertTagSQL, insertTagParams)
            await dbRun(insertProtocolTagSQL, insertProtocolTagParams)
            await dbRun("COMMIT")
        } catch (err) {
            await dbRun("ROLLBACK TRANSACTION")
            throw err
        }
    }
}

module.exports = tagModel