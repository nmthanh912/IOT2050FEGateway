const bodyParser = require('body-parser')
const express = require('express')
const port = 4000
const app = express()

app.use(express.static('public'))
var favicon = require('serve-favicon')
var path = require('path')

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

const cors = require('cors')
app.use(cors({origin: true}))

app.use((req, res, next) => {
    res.locals.user = ''
    next()
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true})) 

// router
const route = require('./routes/index')
route(app)

app.listen(port, function () {
    console.log(`Server listening on port ${port}!`)
})
