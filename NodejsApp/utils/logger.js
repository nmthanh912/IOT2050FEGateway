const redis = require("../redis/redisClient")

const SERVICE_INFO = "Server"

const logError = (message) => {
    redis.pub2Redis('log', {
        serviceName: SERVICE_INFO,
        level: 'error',
        errMsg: message
    })
}

module.exports = { logError }