const db = {}

db.CREATE_DEVICE = `CREATE TABLE IF NOT EXISTS DEVICE (
    ID            TEXT         PRIMARY KEY,
    name          VARCHAR (50) UNIQUE,
    description   TEXT,
    protocolType  TEXT,
    byteOrder     TEXT,
    wordOrder     TEXT,
    scanningCycle INTEGER,
    minRespTime   INTEGER
)`;

db.CREATE_TAG = `CREATE TABLE IF NOT EXISTS TAG (
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
)`;

db.CREATE_MQTT_CLIENT = `CREATE TABLE IF NOT EXISTS MQTT_CLIENT (
    ID          TEXT    PRIMARY KEY,
    description TEXT,
    name        TEXT    NOT NULL,
    username    TEXT,
    password    TEXT,
    IP          TEXT,
    port        INTEGER,
    QoS         INTEGER
)`;

db.CREATE_CONFIGS = `CREATE TABLE IF NOT EXISTS CONFIGS (
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
)`;

db.CREATE_MODBUS_RTU = `CREATE TABLE IF NOT EXISTS MODBUSRTU (
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
)`;

db.CREATE_MODBUS_RTU_TAG = `CREATE TABLE IF NOT EXISTS MODBUSRTU_TAG (
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
)`;

db.CREATE_MODBUS_TCP = `CREATE TABLE IF NOT EXISTS MODBUSTCP (
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
)`;

db.CREATE_MODBUS_TCP_TAG = `CREATE TABLE IF NOT EXISTS MODBUSTCP_TAG (
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
)`;

db.CREATE_OPCUA = `CREATE TABLE IF NOT EXISTS OPC_UA (
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
)`;

db.CREATE_OPCUA_TAG = `CREATE TABLE IF NOT EXISTS OPC_UA_TAG (
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
)`;

db.CREATE_SUBSCRIBES = `CREATE TABLE IF NOT EXISTS SUBSCRIBES (
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
)`;

module.exports = db