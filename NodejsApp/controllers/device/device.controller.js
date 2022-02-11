var db = require('../../models/database.js')

module.exports.getDevice = function (req, res) {
    try {
        const sql = 'SELECT * FROM device'
        var params = []

        db.all(sql, params, (err, rows) => {
            if (err) {
                res.status(400).json({msg: err.message})
                return
            }
            res.json(rows)
        })
    } catch (err) {
        res.json({
            msg: err,
        })
    }
}

module.exports.postDevice = function (req, res) {
    try {
        const sql =
            'INSERT INTO device (name, description, status) VALUES (?, ?, ?)'
        var params = [req.body.name, req.body.description, 'unconfigured']

        db.run(sql, params, (err) => {
            if (err) {
                res.status(400).json({msg: err.message})
                return
            }
            res.json({
                key: '1h24a445',
            })
        })
    } catch (err) {
        res.json({
            msg: err,
        })
    }
}

module.exports.editDevice = function (req, res) {
    try {
        const sql = 'UPDATE device SET name = ?, description = ? WHERE ID = ?'
        var params = [req.body.name, req.body.description, req.params.id]

        db.run(sql, params, (err) => {
            if (err) {
                res.status(400).json({msg: err.message})
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

module.exports.deleteDevice = function (req, res) {
    try {
        const sql = 'DELETE FROM device WHERE ID = ?'
        var params = [req.params.id]

        db.run(sql, params, (err) => {
            if (err) {
                res.status(400).json({msg: err.message})
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
