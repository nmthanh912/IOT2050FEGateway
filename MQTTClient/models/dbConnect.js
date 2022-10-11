require('dotenv').config()
var sqlite3 = require('sqlite3').verbose()
const util = require('util')

const pubRedis = require('../redis/pubRedisClient')
const DB_PATH = process.env.DB_PATH

let db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        pubRedis.pub2Redis('log', {serviceName: 'MQTTClient', level: 'error', errMsg: err})
        console.error(err.message)
    } else {
        pubRedis.pub2Redis('log', {
            serviceName: 'MQTTClient',
            level: 'info',
            errMsg: 'Connected to the SQLite database!',
        })
        console.log('Connected to the SQLite database!')
    }
})

const dbRun = util.promisify(db.run.bind(db))
const dbAll = util.promisify(db.all.bind(db))

module.exports = {
    db,
    dbRun,
    dbAll,
}
