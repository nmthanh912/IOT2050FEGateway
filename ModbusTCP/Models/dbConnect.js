var sqlite3 = require('sqlite3').verbose()
const util = require('util')

let db = new sqlite3.Database('../Database/database.db', (err) => {
    if (err) {
        console.error(err.message)
    } else {
        console.log('Connected to the SQLite database.')
        db.run(
            `CREATE TABLE IF NOT EXISTS device (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                Name VARCHAR(50),
                Description TEXT
                )`,
            (err) => {
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
