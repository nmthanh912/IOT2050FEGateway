require('dotenv').config()
var sqlite3 = require('sqlite3').verbose()
const util = require('util')
const ddl = require('../constants/ddl')

const redis = require('../redis/redisClient')

const DB_PATH = process.env.DB_PATH

let db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        redis.pub2Redis('log', { serviceName: 'Server', level: 'error', errMsg: err })
        console.error(err.message)
        throw err
    }
    console.log('Connected to the SQLite database!')
    redis.pub2Redis('log', { serviceName: 'Server', level: 'info', errMsg: 'Connected to the SQLite database!' })

    db.serialize(() => {
        db.run(ddl.CREATE_DEVICE)
        db.run(ddl.CREATE_TAG)
        db.run(ddl.CREATE_MQTT_CLIENT)
        db.run(ddl.CREATE_CONFIGS)
        db.run(ddl.CREATE_MODBUS_RTU)
        db.run(ddl.CREATE_MODBUS_RTU_TAG)
        db.run(ddl.CREATE_MODBUS_TCP)
        db.run(ddl.CREATE_MODBUS_TCP_TAG)
        db.run(ddl.CREATE_OPCUA)
        db.run(ddl.CREATE_OPCUA_TAG)
        db.run(ddl.CREATE_SUBSCRIBES);

        db.run('PRAGMA foreign_keys = ON', (err) => {
            if (err) {
                redis.pub2Redis('log', { serviceName: 'Server', level: 'error', errMsg: err })
                console.log(err)
            }
        })
    })
})

const dbRun = util.promisify(db.run.bind(db))
const dbAll = util.promisify(db.all.bind(db))

module.exports = { db, dbRun, dbAll }
