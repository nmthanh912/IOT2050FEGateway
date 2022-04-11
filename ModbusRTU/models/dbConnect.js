require('dotenv').config()
const util = require('util')
var sqlite3 = require('sqlite3').verbose()

const redis = require('../redis/redisClient')

const DB_PATH = process.env.MODE === 'development' ? '../Database/database.db' : './Database/database.db'

let db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        redis.pub2Redis('log', {serviceName: 'ModbusRTU', level: 'error', errMsg: err})
        console.error(err.message)
    } else {
        redis.pub2Redis('log', {serviceName: 'ModbusRTU', level: 'info', errMsg: 'Connected to the SQLite database!'})
        console.log('Connected to the SQLite database!')
        db.run(
            `CREATE TABLE IF NOT EXISTS device (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                Name VARCHAR(50),
                Description TEXT
                )`,
            (err) => {
                redis.pub2Redis('log', {serviceName: 'ModbusRTU', level: 'error', errMsg: err})
                console.log('Database already created!')
            }
        )
    }
})

const dbRun = util.promisify(db.run.bind(db))
const dbAll = util.promisify(db.all.bind(db))

module.exports = {
    db,
    dbRun,
    dbAll,
}
