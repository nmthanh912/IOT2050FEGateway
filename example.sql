SELECT 
    device.ID, device.name, 
    tag.ID, tag.name,
    modbusTCP.IP, modbusTCP.port, modbusTCP.slave
FROM
    device JOIN config ON device.ID = config.deviceID
    JOIN tag ON tag.ID = config.tagID
    JOIN config_info ON config.CINFO_ID = config_info.ID
    JOIN modbusTCP ON modbusTCP.CINFO_ID = config_info.ID
GROUP BY device.ID;