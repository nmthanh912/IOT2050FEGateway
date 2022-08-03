
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
    const insertTagQuery = "INSERT INTO TAG VALUES " +
        (tagValueBracket + ", ").repeat(numOfTags).slice(0, -2);
    const insertProtocolTagQuery = `INSERT INTO ${protocolName}_TAG ` +
        (protocolTagValueBracket + ", ").repeat(numOfTags).slice(0, -2)

    return { insertTagQuery, insertProtocolTagQuery }
}

const deviceModel = {
    getAll: async function () {
        return await dbAll("SELECT * FROM DEVICE", []);
    },

    update: async function () {
        return createInsertTagSQL(3, protocolTypes.MODBURTU)
    },

    getConfig: async function (deviceID, protocolName) {
        return dbAll(`
            SELECT * FROM ${protocolName} 
            WHERE ${protocolName}.deviceID = ?
        `, [deviceID]);
    },

    drop: async function (deviceID) {
        await dbRun("DELETE FROM DEVICE WHERE ID = ?", [deviceID]);

        const files = fs
            .readdirSync(JSON_PATH)
            .filter(filename => filename.slice(9, 17) === deviceID);
        const unlinkPromises = files.map(file => unlink(JSON_PATH + "/" + file));

        await Promise.allSettled(unlinkPromises);
    }
}

module.exports = deviceModel