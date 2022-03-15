const handler = async function (res, callback) {
    try {
        await callback()
    } catch (err) {
        res.status(500).send({msg: 'Internal Server Error'})
    }
}

module.exports = handler