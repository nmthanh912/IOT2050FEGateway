const mqtt = require('mqtt')

const mqttClient = mqtt.connect(`mqtt://${configInfos[0].mqttIP}:${configInfos[0].mqttPort}`, {
    username: configInfos[0].mqttUsername,
    password: configInfos[0].mqttPassword,
})
