var db = require('../../models/database.js')
const ShortUniqueId = require('short-unique-id')

module.exports.getDevice = function (req, res) {
    try {
        const sql =
            'SELECT CASE WHEN EXISTS (SELECT deviceID FROM config WHERE device.ID = config.deviceID)' +
            'THEN 1 ELSE 0 END AS checked, device.ID, device.name, device.description FROM device'
        var params = []
        var data = []

        db.all(sql, params, (err, rows) => {
            if (err) {
                res.status(400).json({msg: err.message})
                return
            }

            rows.map((row) => {
                if (row.checked === 1) {
                    data.push({
                        id: row.ID,
                        name: row.name,
                        description: row.description,
                        status: 'configured',
                    })
                } else {
                    data.push({
                        id: row.ID,
                        name: row.name,
                        description: row.description,
                        status: 'unconfigured',
                    })
                }
            })

            res.json(data)
        })
    } catch (err) {
        res.json({
            msg: err,
        })
    }
}

module.exports.postDevice = function (req, res) {
    try {
        const uid = new ShortUniqueId({
            dictionary: 'hex',
            length: 8,
        })

        const id = uid()

        const sql =
            'INSERT INTO device (ID, name, description) VALUES (?, ?, ?)'
        var params = [id, req.body.name, req.body.description]

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
