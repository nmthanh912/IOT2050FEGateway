var sqlite3 = require('sqlite3').verbose()
const util = require('util')

let db = new sqlite3.Database('../Database/database.db', (err) => {
    if (err) {
        console.error(err.message)
        throw err
    }
    console.log('Connected to the SQLite database.')
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
            port        INTEGER
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
                                        ON UPDATE NO ACTION
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
            )
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
            )
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
            node     TEXT,
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
            REFERENCES MQTT_CLIENT (ID),
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
