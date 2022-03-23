const express = require('express')
const port = 4001
const app = express()

const Process = require('./modbus_tcp')

const process = new Process()
process.run()

app.get('/updated', (req, res) => {
    console.log(req.query.pname)
    process.run(true)
    res.json({msg: 'OKE'})
})

app.listen(port, function () {
    console.log(`Server ModbusTCP listening on port ${port}!`)
})
