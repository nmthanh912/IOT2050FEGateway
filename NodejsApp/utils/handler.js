const handler = async function (res, callback) {
    try {
        await callback()
        return true
    } catch (err) {
        console.log(err)
        res.status(500).send({ msg: err.message })
    }
}

module.exports = handler
