var sqlite3 = require('sqlite3').verbose()
const DBSOURCE = process.env.DATABASE_PATH

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        // Cannot connect to database
        console.error(err.message)
        throw err
    } else {
        console.log('Connected to the SQLite database.')
        db.run(
            `CREATE TABLE device (
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

module.exports = db
