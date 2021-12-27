//var InverterDevice = require('../../models/inverter/device.model');
var moment = require('moment')
var db = require('../../models/database.js')

module.exports.list = async function (req, res) {
    try {
        const sql = 'SELECT * FROM mqtt_config'
        var params = []
        db.all(sql, params, (err, rows) => {
            if (err) {
                // res.status(400).json({"error":err.message});
                return
            }
            console.log(rows)
            res.render('mqtt/broker/list', {
                message: 'success',
                brokers: rows,
            })
        })
    } catch (err) {
        console.log(err)
    }
}

module.exports.getAdd = function (req, res) {
    res.render('mqtt/broker/add', {})
}

module.exports.postAdd = function (req, res) {
    try {
        const sql = 'INSERT INTO mqtt_config(name, port, ip, username, password, topic) ' + ' VALUES(?, ?, ?, ?, ?, ?)'
        var params = [req.body.name, req.body.port, req.body.ip, req.body.username, req.body.password, req.body.topic]
        db.run(sql, params, (err, rows) => {
            if (err) {
                // res.status(400).json({"error":err.message});
                return
            }
            //console.log(rows)
            res.redirect('/mqtt/broker/')

            // res.render("modbus-tcp/device/list",{
            // 	message:"success",
            //   devices:rows,
            // });
        })
    } catch (err) {
        console.log(err)
    }

    console.log(req.body)
}

module.exports.getEdit = function (req, res) {
    try {
        var id = req.params.id
        const sql = 'SELECT * FROM mqtt_config where id = ?'
        var params = [id]
        db.all(sql, params, (err, rows) => {
            if (err) {
                // res.status(400).json({"error":err.message});
                return
            }
            console.log(rows)
            res.render('mqtt/broker/edit', {
                message: 'success',
                broker: rows[0],
            })
        })
    } catch (err) {
        console.log(err)
    }

    // InverterDevice.findById(id).then(function(setting){
    // 	res.render('inverter/device/edit', {
    // 		setting: setting
    // 	});
    // });
}

module.exports.postEdit = function (req, res) {
    try {
        var id = req.params.id
        const sql =
            'UPDATE mqtt_config SET name = ?, port = ?, ip = ?, username = ?, password = ?, topic = ? ' +
            ' WHERE id = ?'
        var params = [
            req.body.name,
            req.body.port,
            req.body.ip,
            req.body.username,
            req.body.password,
            req.body.topic,
            id,
        ]
        db.run(sql, params, (err, rows) => {
            if (err) {
                res.status(400).json({error: err.message})
                return
            }
            //console.log(rows)
            res.redirect('/mqtt/broker/')

            // res.render("modbus-tcp/device/list",{
            // 	message:"success",
            //   devices:rows,
            // });
        })
    } catch (err) {
        console.log(err)
    }

    // var query = {"_id": req.params.id};
    // var data = {
    // 	"name" : req.body.name,
    //    "broker" : req.body.broker,
    //    "port" : req.body.port,
    //    // "password" : req.body.password,
    //    // "role" : parseInt(req.body.role),
    //    // "updated_at" : new Date()
    // }
    // //console.log(query)
    // InverterDevice.findOneAndUpdate(query, data, {'upsert':true}, function(err, doc){
    //     if (err) return res.send(500, { error: err });
    //     res.redirect('/inverter/device/edit/' + req.params.id);
    // });
}

module.exports.getDelete = function (req, res) {
    var id = req.params.id
    const sql = 'Delete FROM mqtt_config ' + ' WHERE id = ?'
    var params = [id]
    db.run(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({error: err.message})
            return
        }
        //console.log(rows)
        res.redirect('/mqtt/broker/')

        // res.render("modbus-tcp/device/list",{
        //  message:"success",
        //   devices:rows,
        // });
    })
}

// let readName = async(measureName) => {
// 	let temp = await Measurement.findOne({name: measureName});
// 	console.log(temp.description)
// 	return "a";
// };

// let readName = async(measureName){
// 	return new Promise(function(resolve, reject){
// 		Measurement.findOne({name: measureName},function(err, measurement){
// 			console.log("Temp1 = " + measurement)
//     		if (err) {
//     			reject(err);
//     		} else {
//     			resolve(measurement);
//     		}
//     	});
// 	});
// };
