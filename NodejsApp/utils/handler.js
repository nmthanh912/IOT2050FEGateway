const redis = require('../redis/redisClient')
redis.pubConnection()

const handler = async function (res, callback) {
    try {
        await callback()
        return true
    } catch (err) {
        redis.pub2Redis('log', {serviceName: 'Server', level: 'error', errMsg: err})
        console.log(err)
        res.status(500).send({ msg: err.message })
    }
}

module.exports = handler
