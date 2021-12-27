//var InverterDevice = require('../../models/inverter/device.model');
var moment = require('moment')
var db = require('../../models/database.js')

module.exports.list = async function (req, res) {
    try {
        const sql = 'SELECT * FROM device_config'
        var params = []
        db.all(sql, params, (err, rows) => {
            if (err) {
                return
            }
            console.log(rows)
            res.render('modbus-tcp/device/list', {
                message: 'success',
                devices: rows,
            })
        })
    } catch (err) {
        console.log(err)
    }
}

module.exports.getAdd = function (req, res) {
    res.render('modbus-tcp/device/add', {})
}

module.exports.postAdd = function (req, res) {
    try {
        console.log(req)
        const sql = 'INSERT INTO device_config(name, port, ip, slave, fc_type) ' + ' VALUES(?, ?, ?, ?, ?)'
        var params = [req.body.name, req.body.port, req.body.ip, req.body.slave, req.body.fc_type]
        db.run(sql, params, (err, rows) => {
            if (err) {
                return
            }
            res.redirect('/modbus-tcp/device/')
        })
    } catch (err) {
        console.log(err)
    }

    console.log(req.body)
}

module.exports.getEdit = function (req, res) {
    try {
        var id = req.params.id
        const sql = 'SELECT * FROM device_config where id = ?'
        var params = [id]
        db.all(sql, params, (err, rows) => {
            if (err) {
                return
            }
            console.log(rows)
            res.render('modbus-tcp/device/edit', {
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
        const sql = 'UPDATE device_config SET name = ?, port = ?, ip = ?, slave = ?, fc_type = ? ' + ' WHERE id = ?'
        var params = [req.body.name, req.body.port, req.body.ip, req.body.slave, req.body.fc_type, id]
        db.run(sql, params, (err, rows) => {
            if (err) {
                return
            }
            res.redirect('/modbus-tcp/device/')
        })
    } catch (err) {
        console.log(err)
    }
}

module.exports.getDelete = function (req, res) {
    try {
        var id = req.params.id
        const sql = 'DELETE FROM device_config WHERE id = ?'
        var params = [id]
        db.run(sql, params, (err, rows) => {
            if (err) {
                res.status(400).json({error: err.message})
                return
            }
            res.redirect('/modbus-tcp/device')
        })
    } catch (err) {
        console.log(err)
    }
}
