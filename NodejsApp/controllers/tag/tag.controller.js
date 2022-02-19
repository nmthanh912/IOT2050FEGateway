var db = require('../../models/database.js')
const ShortUniqueId = require('short-unique-id')

module.exports.getTag = function (req, res) {
    try {
        const sql = 'SELECT * FROM tag'
        var params = []
        var data = []

        db.all(sql, params, (err, rows) => {
            if (err) {
                res.status(400).json({msg: err.message})
                return
            }

            rows.map((row) => {
                data.push({
                    id: row.ID,
                    name: row.name,
                    attribute: JSON.parse(row.attribute),
                })
            })

            res.json(data)
        })
    } catch (err) {
        res.json({
            msg: err,
        })
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