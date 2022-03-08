const handler = function (res, callback) {
    try {
        callback()
    } catch (err) {
        res.status(500).send({msg: 'Internal Server Error'})
    }
}

module.exports = handler