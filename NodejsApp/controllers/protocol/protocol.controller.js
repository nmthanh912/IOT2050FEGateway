var db = require('../../models/database.js')
var util = require('util')

module.exports.getProtocol = async function (req, res) {
    try {
        const getData = util.promisify(db.all.bind(db))

        const sql = `SELECT tbl_name FROM sqlite_master WHERE sql LIKE('%REFERENCES config_info%')`
        var data = []
        let protocolName = await getData(sql)

        for (let i = 1; i < protocolName.length; i++) {
            let query = `PRAGMA table_info('${protocolName[i].tbl_name}')`
            let name = protocolName[i].tbl_name
            let attrList = []

            let tableInfos = await getData(query)
            tableInfos.pop()

            tableInfos.map((tableInfo) => {
                attrList.push({
                    name:
                        tableInfo.name[0].toUpperCase() +
                        tableInfo.name.slice(1),
                    type:
                        tableInfo.type[0] +
                        tableInfo.type.slice(1).toLowerCase(),
                })
            })

            data.push({
                name,
                attrList,
            })
        }

        res.json(data)
    } catch (err) {
        console.log('loi roi ne')
        res.json({
            msg: err,
        })
    }
}

module.exports.postProtocol = function (req, res) {
    try {
        const tableName = req.body.name

        let attrList = ''

        req.body.attrList.map((attr) => {
            attrList =
                attrList +
                attr.name.toLowerCase() +
                ' ' +
                attr.type.toUpperCase() +
                ', '
        })

        const sql = `CREATE TABLE ${tableName} (${attrList.slice(
            0,
            attrList.length - 2
        )}, CINFO_ID TEXT PRIMARY KEY, 
        FOREIGN KEY (CINFO_ID) REFERENCES config_info(ID))`

        db.run(sql, [], (err) => {
            if (err) {
                res.status(400).json({
                    msg: err.message,
                })
                return
            }

            res.json({
                key: tableName,
            })
        })
    } catch (err) {
        res.json({
            msg: err,
        })
    }
}

module.exports.editProtocol = function (req, res) {
    try {
        const sql = 'UPDATE protocol SET name = ?, attrList = ? WHERE ID = ?'
        var params = [
            req.body.name,
            JSON.stringify(req.body.attrList),
            req.params.id,
        ]

        db.run(sql, params, (err) => {
            if (err) {
                res.status(400).json({
                    msg: err.message,
                })
                return
            }

            res.json({
                key: req.params.id,
            })
        })
    } catch (err) {
        res.json({
            msg: err,
        })
    }
}

module.exports.deleteProtocol = function (req, res) {
    db.serialize(function () {
        try {
            const name = req.params.name
            const deleteConfig = `DELETE FROM config WHERE config.CINFO_ID IN (SELECT CINFO_ID FROM ${name})`
            const deleteConfigInfo = `DELETE FROM config_info WHERE config_info.ID IN (SELECT CINFO_ID FROM ${name})`
            const deleteProtocol = `DROP TABLE ${name}`

            db.run('begin')

            db.run(deleteConfig, [], (err) => {
                if (err) {
                    res.status(400).json({
                        msg: err.message,
                    })
                    return
                }
            })

            db.run(deleteConfigInfo, [], (err) => {
                if (err) {
                    res.status(400).json({
                        msg: err.message,
                    })
                    return
                }
            })

            db.run(deleteProtocol, [], (err) => {
                if (err) {
                    res.status(400).json({
                        msg: err.message,
                    })
                    return
                }
            })

            db.run('commit')

            res.json({
                key: name,
            })
        } catch (err) {
            res.json({
                msg: err,
            })
        }
    })
}
