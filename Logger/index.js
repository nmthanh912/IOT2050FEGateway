const Redis = require('ioredis')
const createServiceLogger = require('./loggerConstructor')

const loggerSubscriber = new Redis('logger')

const SSOServiceLogger = createServiceLogger('SSO', [{filename: 'error.log', level: 'error'}])

loggerSubscriber.subscribe('log', (err, count) => {
    if (err) {
        process.exit(1)
    }
    console.log(`Subcribed successfully to ${count} ${count > 1 ? 'channels' : 'channel'}`)
})

loggerSubscriber.on('message', (channel, errMsg) => {
    SSOServiceLogger.log('error', errMsg)
})
