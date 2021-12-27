require("dotenv").config();
// -----------Send data with mqtt------------
const mqtt = require("mqtt");

// -----------Socket io connection------------
const io = require("socket.io-client");
var ip = process.env.IP;
ioClient = io.connect(`http://${ip}:4001`);
ioClient.on("connect", function () {
  console.log("IO connected");
});

// ----------Export csv file----------------
//const ObjectsToCsv = require("objects-to-csv");

// ---------SQLite DB-----------
var db = require("../models/database");

// ---------Modbus serial--------
var modbusRTU = require("modbus-serial");
const { resolve } = require("bluebird");

// open connection to serial port
const client = new modbusRTU();
var options;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let devices = [];
let mqttTopic = [];

main();
async function main() {
  await getDevice();
  setTimeout(getDataFromDevices, 2000);
}

async function getDevice() {
  // Read device_rtu_config table in sqlite
  const deviceQuerry = "SELECT * FROM device_rtu_config";
  var params = [];
  db.all(deviceQuerry, params, (err, rows) => {
    if (err) {
      console.log("DB has error ", err.message);
    }
    client.connectRTUBuffered(rows[0].com_port_num, options);
    // set timeout, if slave did not reply back
    client.setTimeout(500);
    rows.forEach(function (row) {
      let dv = {
        id: row.id,
        name: row.name,
        com_port_num: row.com_port_num,
        baudrate: row.baudrate,
        databits: row.databits,
        parity: row.parity,
        stopbits: row.stopbits,
        slave: row.slave,
        tags: [],
      };

      // Read tag_rtu_config table with device_id
      const tagQuerry = "SELECT * FROM tag_rtu_config WHERE device_id = ?";
      var params1 = [parseInt(row.id)];
      db.all(tagQuerry, params1, (err, row1s) => {
        if (err) {
          console.log(err);
        }
        row1s.forEach(function (row1) {
          dv.tags.push({
            name: row1.name,
            tag: row1.tag,
            addr: row1.address,
            unit: row1.unit,
            length: row1.length,
            value_type: row1.value_type,
            id: row1.id,
          });
        });
        devices.push(dv);
      });
    });
  });

  // Config mqtt broker
  mqttQuery = "SELECT * FROM mqtt_config";
  params = [];
  db.all(mqttQuery, params, (err, rows) => {
    if (err) {
      console.log("DB has error ", err.message);
    }

    rows.forEach((row) => {
      mqttTopic.push(row);
    });

    options = {
      username: mqttTopic[0].username,
      password: mqttTopic[0].password,
    };
  });
}

async function getDataFromDevices() {
  const mqttClient = mqtt.connect(
    "mqtt://" + mqttTopic[0].ip + ":" + mqttTopic[0].port,
    options
  );
  getData();

  async function getData() {
    try {
      if (devices.length > 0) {
        options = {
          baudRate: devices[0].baudrate,
          dataBits: devices[0].databits,
          parity: devices[0].parity,
          stopBits: devices[0].stopbits,
        };

        for (let device of devices) {
          if (device.tags.length > 0) {
            // set ID of slave
            await client.setID(device.slave);
            let tags = device.tags;
            let arrSaveData = [];

            // loop to read value
            for (let i = 0; i < tags.length; i++) {
              await client
                .readHoldingRegisters(tags[i].addr, 2)
                .then((data) => {
                  let buf = Buffer.allocUnsafe(4);
                  if (tags[i].value_type == 1) {
                    buf.writeUInt16BE(data.data[0], 0);
                    buf.writeUInt16BE(data.data[1], 2);
                  } else {
                    buf.writeUInt16BE(data.data[0], 2);
                    buf.writeUInt16BE(data.data[1], 0);
                  }

                  tmp = {
                    id: tags[i].id,
                    name: tags[i].name,
                    tag: tags[i].tag,
                    unit: tags[i].unit,
                    addr: tags[i].addr,
                    value: parseFloat(buf.readFloatBE().toFixed(2)),
                  };

                  console.log("name: ", tmp.name, "value: ", tmp.value);
                  arrSaveData.push(tmp);
                })
                .catch(() => {
                  console.log("Error");
                  console.error(arguments);
                });

              let insertQuerry =
                "INSERT INTO modbusRTUValue (name_device, id_device, tag_name, tag, unit, value, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)";
              db.run(insertQuerry, [
                device.name,
                device.id,
                tmp.name,
                tmp.tag,
                tmp.unit,
                tmp.value,
                new Date(),
              ]);

              dataInsertToCSV = [
                {
                  "Name Device": device.name,
                  "ID Device": device.id,
                  "Tag Name": tmp.name,
                  Tag: tmp.tag,
                  Unit: tmp.unit,
                  Value: tmp.value,
                  TimeStamp: new Date(),
                },
              ];

              //const csv = new ObjectsToCsv(dataInsertToCSV);
              // Save to file:
              //await csv.toDisk("./csv/modbusRTUValue.csv", { append: true });

              data = JSON.stringify(dataInsertToCSV);
              for (let i = 0; i < mqttTopic.length; i++) {
                mqttClient.publish(mqttTopic[i].topic, data);
              }
            }

            if (arrSaveData.length > 0) {
              arr = {
                device_id: device.id,
                device: device.name,
                value: arrSaveData,
                timestamp: new Date(),
                flag: 0,
              };
              ioClient.emit("modbus_rtu", arr);
            }
          }
          // wait 500ms before get another device
          await sleep(500);
        }
      }
    } catch (e) {
      console.log("Error in get data from devices: ", e);
    } finally {
      // after get all data from salve repeate it again
      setImmediate(() => {
        getData();
      });
    }
  }
}
