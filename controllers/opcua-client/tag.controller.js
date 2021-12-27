var db = require('../../models/database.js')

module.exports.list = async function (req, res) {
    try {
        const sql =
            'SELECT tag_opc_config.name as tagname, tag_opc_config.id as tagid, ' +
            'device_opc_config.id as deviceid, device_opc_config.name as devicename, * ' +
            ' FROM tag_opc_config JOIN device_opc_config ON tag_opc_config.device_id = device_opc_config.id'
        var params = []
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.log('Err: ', err.message)
                return
            }
            res.render('opcua-client/tag/list', {
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
        const sql = 'SELECT * FROM device_opc_config'
        var params = []
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.log('Err: ', err.message)
                return
            }
            console.log(rows)
            res.render('opcua-client/tag/add', {
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
        const sql = 'INSERT INTO tag_opc_config(name, tag, nodeID, unit, device_id ) ' + ' VALUES(?, ?, ?, ?, ?)'
        var params = [req.body.name, req.body.tag, req.body.nodeID, req.body.unit, req.body.device_id]
        db.run(sql, params, (err, rows) => {
            if (err) {
                res.status(400).json({error: err.message})
                return
            }
        })

        res.redirect('/opcua-client/tag/')
    } catch (err) {
        console.log(err)
    }
}

module.exports.getEdit = function (req, res) {
    let devices
    try {
        let sql = 'SELECT * FROM device_opc_config'
        let params = []
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.log('Err: ', err.message)
                return
            }
            devices = rows
        })

        let id = req.params.id
        sql = 'SELECT * FROM tag_opc_config where id = ?'
        params = [id]
        db.all(sql, params, (err, rows) => {
            if (err) {
                res.status(400).json({error: err.message})
                return
            }
            res.render('opcua-client/tag/edit', {
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
        const sql = 'UPDATE tag_opc_config SET name = ?, tag = ?, nodeID = ?, unit = ?, device_id = ?' + ' WHERE id = ?'
        var params = [req.body.name, req.body.tag, req.body.nodeID, req.body.unit, req.body.device_id, id]
        db.run(sql, params, (err, rows) => {
            if (err) {
                console.log('Err: ', err.message)
                return
            }
            res.redirect('/opcua-client/tag/')
        })
    } catch (err) {
        console.log(err)
    }
}

module.exports.getDelete = function (req, res) {
    try {
        var id = req.params.id
        const sql = 'DELETE FROM tag_opc_config WHERE id = ?'
        var params = [id]
        db.run(sql, params, (err, rows) => {
            if (err) {
                console.log('Err: ', err.message)
                return
            }
            res.redirect('/opcua-client/tag')
        })
    } catch (err) {
        console.log(err)
    }
}
