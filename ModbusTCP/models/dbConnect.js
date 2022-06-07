require('dotenv').config()
var sqlite3 = require('sqlite3').verbose()
const util = require('util')

const redis = require('../redis/redisClient')
redis.pubConnection()

const DB_PATH = process.env.MODE === 'development' ? '../Database/database.db' : './Database/database.db'

let db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        redis.pub2Redis('log', {serviceName: 'ModbusTCP', level: 'error', errMsg: err})
        console.error(err.message)
    } else {
        redis.pub2Redis('log', {serviceName: 'ModbusTCP', level: 'info', errMsg: 'Connected to the SQLite database!'})
        console.log('Connected to the SQLite database!')
        // db.run(
        //     `CREATE TABLE IF NOT EXISTS DEVICE (
        //         ID            TEXT         PRIMARY KEY,
        //         name          VARCHAR (50) UNIQUE,
        //         description   TEXT,
        //         protocolType  TEXT,
        //         byteOrder     TEXT,
        //         wordOrder     TEXT,
        //         scanningCycle INTEGER,
        //         minRespTime   INTEGER
        //     )`,
        //     (err) => {
        //         redis.pub2Redis('log', {serviceName: 'ModbusTCP', level: 'error', errMsg: 'Database already created!'})
        //         console.log('Database already created!')
        //     }
        // )
    }
})

const dbRun = util.promisify(db.run.bind(db))
const dbAll = util.promisify(db.all.bind(db))

module.exports = {
    db,
    dbRun,
    dbAll,
}
