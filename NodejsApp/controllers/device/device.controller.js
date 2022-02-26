const ShortUniqueId = require('short-unique-id')
const util = require('util')
const {db, dbRun, dbAll} = require('../../models/database')

module.exports.getDevice = async function (req, res) {
    const getDevice = `SELECT * FROM DEVICE`
    var params = []
    var data = []

    try {
        const devices = await dbAll(getDevice, params)

        devices.map((device) => {
            data.push({
                ID: device.ID,
                name: device.name,
                description: device.description,
                protocol: device.protocolType,
            })
        })

        res.json(data)
    } catch (err) {
        res.status(500).send({msg: 'Internal Server Error'})
    }
}

module.exports.postDevice = async function (req, res) {
    const uid = new ShortUniqueId({
        dictionary: 'hex',
        length: 8,
    })
    const id = uid()

    const inserDevice =
        'INSERT INTO DEVICE (ID, name, description, protocolType) VALUES (?, ?, ?, ?)'
    const deviceParams = [
        id,
        req.body.name,
        req.body.description,
        req.body.protocol.toUpperCase(),
    ]
    const protocolName = req.body.protocol.toUpperCase()
    const protocolParams = Object.values(req.body.config)
    protocolParams.push(id)

    const insertProtocol = `INSERT INTO ${protocolName} VALUES (${',?'
        .repeat(protocolParams.length)
        .slice(1)})`
    try {
        await dbRun(inserDevice, deviceParams)
        await dbRun(insertProtocol, protocolParams)

        res.json({
            key: id,
        })
    } catch (err) {
        res.status(500).send({msg: 'Internal Server Error'})
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
