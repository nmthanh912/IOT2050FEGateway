const { dbAll } = require("./database")

const deviceModel = {
    getAll: async function () {
        return await dbAll("SELECT * FROM DEVICE", []);
    },
    create: async function (deviceData) {
        const deviceId = uniqueId();
        const deviceQuery = `INSERT INTO DEVICE 
            (ID, name, description, protocolType, byteOrder, wordOrder, scanningCycle, minRespTime) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const deviceParams = [
            id,
            deviceData.name,
            deviceData.description,
            deviceData.protocol.toUpperCase(),
            deviceData.byteOrder,
            deviceData.wordOrder,
            deviceData.scanningCycle,
            deviceData.minRespTime,
        ];
        const protocolName = deviceData.protocol.toUpperCase()
        const tagList = data.tagList;

        if (protocolParams.length === 0) {
            const proInfoQuery = `PRAGMA table_info(${protocolName})`;
            const infoProTable = await dbAll(proInfoQuery);
            protocolParams = Array(infoProTable.length - 1).fill(null);
        }
        protocolParams.push(id);
        const protocolQuery = `INSERT INTO ${protocolName} VALUES (${",?"
            .repeat(protocolParams.length)
            .slice(1)})`;

        if (tagList.length !== 0 && Object.keys(tagList[0]).length !== 0) {
            const { proTagQuery, proTagParams, tagQuery, tagParams } =
                this.setupTagSql(tagList, protocolName, id);

            try {
                await Promise.all([
                    dbRun(deviceQuery, deviceParams),
                    dbRun(protocolQuery, protocolParams),
                    dbRun(tagQuery, tagParams),
                    dbRun(proTagQuery, proTagParams),
                ]);
            } catch (err) {
                await this.handleErrCreate(id);
                throw err;
            }
        } else {
            try {
                await Promise.all([
                    dbRun(deviceQuery, deviceParams),
                    dbRun(protocolQuery, protocolParams),
                ]);
            } catch (err) {
                await this.handleErrCreate(id);
                throw err;
            }
        }
    }
}

module.exports = deviceModel