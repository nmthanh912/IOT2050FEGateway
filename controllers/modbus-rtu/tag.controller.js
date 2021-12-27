var db = require('../../models/database.js')

module.exports.list = async function (req, res) {
    try {
        const sql =
            'SELECT tag_rtu_config.name as tagname, tag_rtu_config.id as tagid, ' +
            'device_rtu_config.id as deviceid, device_rtu_config.name as devicename, * ' +
            ' FROM tag_rtu_config JOIN device_rtu_config ON tag_rtu_config.device_id = device_rtu_config.id'
        var params = []
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.log('Err: ', err.message)
                return
            }
            res.render('modbus-rtu/tag/list', {
                message: 'success',
                tags: rows,
            })
        })
    } catch (err) {
        console.log(err)
    }
}

module.exports.getAdd = function (req, res) {
    try {
        const sql = 'SELECT * FROM device_rtu_config'
        var params = []
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.log('Err: ', err.message)
                return
            }
            console.log(rows)
            res.render('modbus-rtu/tag/add', {
                message: 'success',
                devices: rows,
            })
        })
    } catch (err) {
        console.log(err)
    }
}

module.exports.postAdd = function (req, res) {
    try {
        const sql =
            'INSERT INTO tag_rtu_config(name, address, unit, device_id, tag, value_type) ' + ' VALUES(?, ?, ?, ?, ?, ?)'
        var params = [
            req.body.name,
            req.body.address,
            req.body.unit,
            req.body.device_id,
            req.body.tag,
            req.body.value_type,
        ]
        db.run(sql, params, (err, rows) => {
            if (err) {
                res.status(400).json({error: err.message})
                return
            }
        })

        res.redirect('/modbus-rtu/tag/')
    } catch (err) {
        console.log(err)
    }
}

module.exports.getEdit = function (req, res) {
    let devices
    try {
        let sql = 'SELECT * FROM device_rtu_config'
        let params = []
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.log('Err: ', err.message)
                return
            }
            devices = rows
        })

        let id = req.params.id
        sql = 'SELECT * FROM tag_rtu_config where id = ?'
        params = [id]
        db.all(sql, params, (err, rows) => {
            if (err) {
                res.status(400).json({error: err.message})
                return
            }
            res.render('modbus-rtu/tag/edit', {
                message: 'success',
                tag: rows[0],
                devices: devices,
            })
        })
    } catch (err) {
        console.log(err)
    }
}

module.exports.postEdit = function (req, res) {
    try {
        var id = req.params.id
        const sql =
            'UPDATE tag_rtu_config SET name = ?, address = ?, unit = ?, device_id = ?, tag = ?, value_type = ?' +
            ' WHERE id = ?'
        var params = [
            req.body.name,
            req.body.address,
            req.body.unit,
            req.body.device_id,
            req.body.tag,
            req.body.value_type,
            id,
        ]
        db.run(sql, params, (err, rows) => {
            if (err) {
                console.log('Err: ', err.message)
                return
            }
            res.redirect('/modbus-rtu/tag/')
        })
    } catch (err) {
        console.log(err)
    }
}

module.exports.getDelete = function (req, res) {
    try {
        var id = req.params.id
        const sql = 'DELETE FROM tag_rtu_config WHERE id = ?'
        var params = [id]
        db.run(sql, params, (err, rows) => {
            if (err) {
                console.log('Err: ', err.message)
                return
            }
            res.redirect('/modbus-rtu/tag')
        })
    } catch (err) {
        console.log(err)
    }
}
