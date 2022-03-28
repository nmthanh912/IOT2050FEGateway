const express = require('express')
const port = 4001
const app = express()

const Process = require('./modbusTCP')
const process = new Process()
process.run()

app.listen(port, function () {
    console.log(`Server ModbusTCP listening on port ${port}!`)
})
