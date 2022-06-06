require('dotenv').config()
var sqlite3 = require('sqlite3').verbose()
const util = require('util')
const redis = require('../redis/redisClient')
redis.pubConnection()

const DB_PATH = process.env.MODE === 'development' ? '../Database/database.db' : './Database/database.db'

let db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        redis.pub2Redis('log', {serviceName: 'Server', level: 'error', errMsg: err})
        console.error(err.message)
        throw err
    }
    console.log('Connected to the SQLite database!')
    redis.pub2Redis('log', {serviceName: 'Server', level: 'info', errMsg: 'Connected to the SQLite database!'})

    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS DEVICE (
            ID            TEXT         PRIMARY KEY,
            name          VARCHAR (50) UNIQUE,
            description   TEXT,
            protocolType  TEXT,
            byteOrder     TEXT,
            wordOrder     TEXT,
            scanningCycle INTEGER,
            minRespTime   INTEGER
        )`)
        db.run(`CREATE TABLE IF NOT EXISTS TAG (
            deviceID TEXT,
            name     TEXT,
            PRIMARY KEY (
                deviceID,
                name
            ),
            FOREIGN KEY (
                deviceID
            )
            REFERENCES DEVICE (ID) ON DELETE CASCADE
                                   ON UPDATE CASCADE
        )`)
        db.run(`CREATE TABLE IF NOT EXISTS MQTT_CLIENT (
            ID          TEXT    PRIMARY KEY,
            description TEXT,
            name        TEXT    NOT NULL,
            username    TEXT,
            password    TEXT,
            IP          TEXT,
            port        INTEGER,
            QoS         INTEGER
        )`)
        db.run(`CREATE TABLE IF NOT EXISTS CONFIGS (
            gatewayID TEXT,
            deviceID  TEXT,
            toggle    BOOLEAN NOT NULL
                              DEFAULT (0),
            PRIMARY KEY (
                gatewayID,
                deviceID
            ),
            FOREIGN KEY (
                deviceID
            )
            REFERENCES DEVICE (ID) ON DELETE CASCADE
                                   ON UPDATE CASCADE,
            FOREIGN KEY (
                gatewayID
            )
            REFERENCES MQTT_CLIENT (ID) ON DELETE CASCADE
        )`)
        db.run(`CREATE TABLE IF NOT EXISTS MODBUSRTU (
            com_port_num VARCHAR (15),
            parity       VARCHAR (15),
            slaveid      SMALLINT,
            baudrate     INTEGER,
            stopbits     TINYINT,
            databits     TINYINT,
            deviceID     TEXT,
            FOREIGN KEY (
                deviceID
            )
            REFERENCES DEVICE (ID) ON DELETE CASCADE
                                   ON UPDATE CASCADE,
            PRIMARY KEY (
                deviceID
            )
        )`)
        db.run(`CREATE TABLE IF NOT EXISTS MODBUSRTU_TAG (
            name     TEXT,
            address  INTEGER,
            unit     TEXT,
            dataType TEXT,
            PF       INTEGER,
            size     INTEGER,
            deviceID TEXT,
            FOREIGN KEY (
                name,
                deviceID
            )
            REFERENCES TAG (name,
            deviceID) ON DELETE CASCADE
                      ON UPDATE CASCADE,
            PRIMARY KEY (
                name,
                deviceID
            ),
            CONSTRAINT unique_address UNIQUE(deviceID, address)
        )`)
        db.run(`CREATE TABLE IF NOT EXISTS MODBUSTCP (
            ip       TEXT,
            port     INTEGER,
            slaveid  INTEGER,
            deviceID TEXT,
            FOREIGN KEY (
                deviceID
            )
            REFERENCES DEVICE (ID) ON DELETE CASCADE
                                   ON UPDATE CASCADE,
            PRIMARY KEY (
                deviceID
            )
        )`)
        db.run(`CREATE TABLE IF NOT EXISTS MODBUSTCP_TAG (
            name     TEXT,
            address  INTEGER,
            unit     TEXT,
            dataType TEXT,
            PF       INTEGER,
            size     INTEGER,
            deviceID TEXT,
            FOREIGN KEY (
                name,
                deviceID
            )
            REFERENCES TAG (name,
            deviceID) ON DELETE CASCADE
                      ON UPDATE CASCADE,
            PRIMARY KEY (
                name,
                deviceID
            ),
            CONSTRAINT unique_address UNIQUE(deviceID, address)
        )`)
        db.run(`CREATE TABLE IF NOT EXISTS OPC_UA (
            url      TEXT,
            deviceID TEXT,
            FOREIGN KEY (
                deviceID
            )
            REFERENCES DEVICE (ID) ON DELETE CASCADE
                                   ON UPDATE CASCADE,
            PRIMARY KEY (
                deviceID
            )
        )`)
        db.run(`CREATE TABLE IF NOT EXISTS OPC_UA_TAG (
            name     TEXT,
            nodeid     TEXT,
            unit     TEXT,
            deviceID TEXT,
            FOREIGN KEY (
                name,
                deviceID
            )
            REFERENCES TAG (name,
            deviceID) ON DELETE CASCADE
                      ON UPDATE CASCADE,
            PRIMARY KEY (
                name,
                deviceID
            )
        )`)
        db.run(`CREATE TABLE IF NOT EXISTS SUBSCRIBES (
            gatewayID TEXT,
            deviceID  TEXT,
            tagName   TEXT,
            PRIMARY KEY (
                gatewayID,
                deviceID,
                tagName
            ),
            FOREIGN KEY (
                gatewayID
            )
            REFERENCES MQTT_CLIENT (ID) ON DELETE CASCADE,
            FOREIGN KEY (
                deviceID,
                tagName
            )
            REFERENCES TAG (deviceID,
            name) ON DELETE CASCADE
                  ON UPDATE CASCADE
        )`)

        db.run('PRAGMA foreign_keys = ON', (err) => {
            if (err) {
                redis.pub2Redis('log', {serviceName: 'Server', level: 'error', errMsg: err})
                console.log(err)
            }
        })
    })
})

const dbRun = util.promisify(db.run.bind(db))
const dbAll = util.promisify(db.all.bind(db))

module.exports = {
    db,
    dbRun,
    dbAll,
}
