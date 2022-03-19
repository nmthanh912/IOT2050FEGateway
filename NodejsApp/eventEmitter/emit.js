const EventEmitter = require('events').EventEmitter
const axios = require('axios')

const eventEmitter = new EventEmitter()

eventEmitter.on('device/updateInfo', function () {
    axios.get(`http://localhost:4002/updated`).then((response) => {
        console.log(response.data)
        console.log('Device has been updated !')
    })
})

module.exports = eventEmitter
