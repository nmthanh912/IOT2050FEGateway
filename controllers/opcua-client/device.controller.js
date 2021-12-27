var moment = require('moment')
var db = require('../../models/database.js')

module.exports.list = async function (req, res) {
    try {
        const sql = 'SELECT * FROM device_opc_config'
        var params = []
        db.all(sql, params, (err, rows) => {
            if (err) {
                return
            }
            console.log(rows)
            res.render('opcua-client/device/list', {
                message: 'success',
                devices: rows,
            })
        })
    } catch (err) {
        console.log(err)
    }
}

module.exports.getAdd = function (req, res) {
    res.render('opcua-client/device/add', {})
}

module.exports.postAdd = function (req, res) {
    try {
        console.log(req)
        const sql = 'INSERT INTO device_opc_config(name, url) ' + ' VALUES(?, ?)'
        var params = [req.body.name, req.body.url]
        db.run(sql, params, (err, rows) => {
            if (err) {
                return
            }
            res.redirect('/opcua-client/device/')
        })
    } catch (err) {
        console.log(err)
    }
    console.log(req.body)
}

module.exports.getEdit = function (req, res) {
    try {
        var id = req.params.id
        const sql = 'SELECT * FROM device_opc_config where id = ?'
        var params = [id]
        db.all(sql, params, (err, rows) => {
            if (err) {
                return
            }
            console.log(rows)
            res.render('opcua-client/device/edit', {
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
        const sql = 'UPDATE device_opc_config SET name = ?, url = ?' + ' WHERE id = ?'
        var params = [req.body.name, req.body.url, id]
        db.run(sql, params, (err, rows) => {
            if (err) {
                return
            }
            res.redirect('/opcua-client/device/')
        })
    } catch (err) {
        console.log(err)
    }
}

module.exports.getDelete = function (req, res) {
    try {
        var id = req.params.id
        const sql = 'DELETE FROM device_opc_config WHERE id = ?'
        var params = [id]
        db.run(sql, params, (err, rows) => {
            if (err) {
                res.status(400).json({error: err.message})
                return
            }
            res.redirect('/opcua-client/device')
        })
    } catch (err) {
        console.log(err)
    }
}
