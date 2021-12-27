var moment = require("moment");
var db = require("../../models/database.js");

module.exports.list = async function (req, res) {
  try {
    const sql =
      "SELECT tag_config.name as tagname, tag_config.id as tagid, device_config.name as devicename, * " +
      " FROM tag_config JOIN device_config ON tag_config.device_id = device_config.id";
    var params = [];
    db.all(sql, params, (err, rows) => {
      if (err) {
        return;
      }
      console.log(rows);
      res.render("modbus-tcp/tag/list", {
        message: "success",
        tags: rows,
      });
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.getAdd = function (req, res) {
  try {
    const sql = "SELECT * FROM device_config";
    var params = [];
    db.all(sql, params, (err, rows) => {
      if (err) {
        return;
      }
      console.log(rows);
      res.render("modbus-tcp/tag/add", {
        message: "success",
        devices: rows,
      });
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.postAdd = function (req, res) {
  try {
    const sql =
      "INSERT INTO tag_config(name, address, unit, device_id) " +
      " VALUES(?, ?, ?, ?)";
    var params = [
      req.body.name,
      req.body.address,
      req.body.unit,
      req.body.device_id,
    ];
    db.run(sql, params, (err, rows) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.redirect("/modbus-tcp/tag/");
    });
  } catch (err) {
    console.log(err);
  }

  console.log(req.body);
};

module.exports.getEdit = function (req, res) {
  let devices;
  try {
    let sql = "SELECT * FROM device_config";
    let params = [];
    db.all(sql, params, (err, rows) => {
      if (err) {
        return;
      }
      devices = rows;
    });

    let id = req.params.id;
    sql = "SELECT * FROM tag_config where id = ?";
    params = [id];
    db.all(sql, params, (err, rows) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      console.log(rows);
      res.render("modbus-tcp/tag/edit", {
        message: "success",
        tag: rows[0],
        devices: devices,
      });
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.postEdit = function (req, res) {
  try {
    var id = req.params.id;
    const sql =
      "UPDATE tag_config SET name = ?, address = ?, unit = ?, device_id = ? " +
      " WHERE id = ?";
    var params = [
      req.body.name,
      req.body.address,
      req.body.unit,
      req.body.device_id,
      id,
    ];
    db.run(sql, params, (err, rows) => {
      if (err) {
        return;
      }
      res.redirect("/modbus-tcp/tag/");
    });
  } catch (err) {
    console.log(err);
  }
};
