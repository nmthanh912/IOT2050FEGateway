var moment = require('moment')
var db = require('../../models/database.js')

module.exports.list = async function (req, res) {
    try {
        const sql = 'SELECT * FROM device_rtu_config'
        var params = []
        db.all(sql, params, (err, rows) => {
            if (err) {
                return
            }
            console.log(rows)
            res.render('modbus-rtu/device/list', {
                message: 'success',
                devices: rows,
            })
        })
    } catch (err) {
        console.log(err)
    }
}

module.exports.getAdd = function (req, res) {
    res.render('modbus-rtu/device/add', {})
}

module.exports.postAdd = function (req, res) {
    try {
        console.log(req)
        const sql =
            'INSERT INTO device_rtu_config(name, com_port_num, baudrate, databits, parity, stopbits, slave) ' +
            ' VALUES(?, ?, ?, ?, ?, ?, ?)'
        var params = [
            req.body.name,
            req.body.com_port_num,
            req.body.baudrate,
            req.body.databits,
            req.body.parity,
            req.body.stopbits,
            req.body.slave,
        ]
        db.run(sql, params, (err, rows) => {
            if (err) {
                return
            }
            res.redirect('/modbus-rtu/device/')
        })
    } catch (err) {
        console.log(err)
    }
    console.log(req.body)
}

module.exports.getEdit = function (req, res) {
    try {
        var id = req.params.id
        const sql = 'SELECT * FROM device_rtu_config where id = ?'
        var params = [id]
        db.all(sql, params, (err, rows) => {
            if (err) {
                return
            }
            console.log(rows)
            res.render('modbus-rtu/device/edit', {
                message: 'success',
                device: rows[0],
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
            'UPDATE device_rtu_config SET name = ?, com_port_num = ?, baudrate = ?, databits = ?, parity = ?, stopbits = ?, slave = ? ' +
            ' WHERE id = ?'
        var params = [
            req.body.name,
            req.body.com_port_num,
            req.body.baudrate,
            req.body.databits,
            req.body.parity,
            req.body.stopbits,
            req.body.slave,
            id,
        ]
        db.run(sql, params, (err, rows) => {
            if (err) {
                return
            }
            res.redirect('/modbus-rtu/device/')
        })
    } catch (err) {
        console.log(err)
    }
}

module.exports.getDelete = function (req, res) {
    try {
        var id = req.params.id
        const sql = 'DELETE FROM device_rtu_config WHERE id = ?'
        var params = [id]
        db.run(sql, params, (err, rows) => {
            if (err) {
                res.status(400).json({error: err.message})
                return
            }
            res.redirect('/modbus-rtu/device')
        })
    } catch (err) {
        console.log(err)
    }
}
