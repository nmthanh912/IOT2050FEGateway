const EventEmitter = require('events').EventEmitter
const axios = require('axios')

const eventEmitter = new EventEmitter()
const protocols = [
    {
        name: 'MODBUSTCP',
        port: 4001,
    },
    {
        name: 'MODBUSRTU',
        port: 4002,
    },
]

eventEmitter.on('device/updateInfo', function (protocolName) {
    let protocol = protocols.find((p) => p.name === protocolName)

    axios.get(`http://localhost:${protocol.port}/updated?pname=${protocolName}`).then((response) => {
        console.log(response.data)
        console.log('Device has been updated !')
    })
})

module.exports = eventEmitter
