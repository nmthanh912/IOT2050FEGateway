const ShortUniqueId = require('short-unique-id')
const {db, dbRun, dbAll} = require('../../models/database.js')

module.exports.getTag = async function (req, res) {
    const getTag = `SELECT * FROM ${req.query.protocol}_TAG WHERE deviceID = ?`
    const params = [req.params.id]

    try {
        const tags = await dbAll(getTag, params)
        tags.forEach((tag) => {
            delete tag.deviceID
        })

        res.json(tags)
    } catch (err) {
        res.status(500).send({msg: 'Internal Server Error'})
    }
}

module.exports.postTag = function (req, res) {
    try {
        const uid = new ShortUniqueId({
            dictionary: 'hex',
            length: 8,
        })

        const id = uid()

        const sql = 'INSERT INTO tag (ID, name, attribute) VALUES (?, ?, ?)'
        var params = [id, req.body.name, JSON.stringify(req.body.attribute)]

        db.run(sql, params, (err) => {
            if (err) {
                res.status(400).json({msg: err.message})
                return
            }

            res.json({
                key: id,
            })
        })
    } catch (err) {
        res.json({
            msg: err,
        })
    }
}

module.exports.editTag = function (req, res) {
    try {
        const sql = 'UPDATE tag SET name = ?, attribute = ? WHERE ID = ?'
        var params = [
            req.body.name,
            JSON.stringify(req.body.data),
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

module.exports.deleteTag = function (req, res) {
    try {
        const sql = 'DELETE FROM tag WHERE ID = ?'
        var params = [req.params.id]

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
