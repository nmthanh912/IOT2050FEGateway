const Redis = require('ioredis')
const logger = require('..Logger/winston')

class RedisClient {
    constructor() {
        this.options = {
            host: '127.0.0.1',
            port: 6379,
            maxRetriesPerRequest: null,
            retryStrategy(times) {
                const delay = Math.min(times * 50, 2000)
                return delay
            },
            reconnectOnError() {
                return true
            },
        }
        this.redisPub = null
        this.redisSub = null

        if (this.#isConfigValid) {
            logger.info('Starting RedisClient...')
            try {
                this.start()
            } catch (err) {
                logger.error(new Error('Could not start RedisClient!' + err))
            }
        }
    }

    #isConfigValid(config) {
        //check if some params are not null
        var valid = false
        return valid
    }

    //Connectivity methods
    start() {
        const options = this.options
        this.redisPub = new Redis(options)
        this.redisSub = new Redis(options)

        this.redisPub.on('connect', () => {
            console.log('ModbusTCP container connected to Redis Broker successfully')
        })

        this.redisPub.on('error', (err) => {
            console.log('Could not connect to Redis Broker ' + err.toString())
        })
    }

    stop() {
        this.redisPub.disconnect()
        this.redisSub.disconnect()
    }

    pub2Redis(channel, msg) {
        this.redisPub.publish(channel, JSON.stringify(msg))
    }

    subRedis(pattern) {
        this.redisClient.psubscribe(pattern, (err, count) => {})
        this.redisClient.on('pmessage', (pattern, channel, message) => {
            // channel có dạng config:modbus:command .Trong đó: command = create|delete|modify , message = id của device
            this.#handler(channel, message)
        })
    }

    //Data handler methods
    #handler(command, id) {
        //check if we recieves a create command from Interface
        if (command == config.create) {
            //call PoolController to create a new ModbusTCPClient instance (Observer Pattern)
        } else if (command == config.delete) {
            //call PoolController to delete a specific ModbusTCPClient instance with its id
        } else if (command == config.modify) {
            //call PoolController to modify a specific ModbusTCPClient instance with its id
        }
    }
}

module.exports = new RedisClient()
