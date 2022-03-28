const Redis = require('ioredis')
const logger = require('..Logger/winston');

class RedisClient{
    //Initialize a RedisClient instance by passing a config to it
    constructor(config){
        //properties and their default values
        this._host = '127.0.0.1';
        this._ip = 6379;
        this._redisClient = null;
        this._poolController = null;
        if (this.#isConfigValid){
            logger.info('Starting RedisClient...')
            try{
                this.start();
            }catch(e){
                logger.error(new Error('Could not start RedisClient!'));
            }  

        }
    }

    #isConfigValid(config){
        //check if some params are not null
        var valid = false;
        return valid;
    }

    //Connectivity methods
    start(){
        //initilize a redis client with parameters
        this._redisClient = new Redis(/*params here*/);
        try{
            this._redisClient.connect();
            logger.info('ModbusTCP container connected to Redis Broker successfully')
            this._redisClient.subRedis(config.pattern2Sub);            
        }catch(e){
            logger.error('Could not connect to Redis Broker ' + e.toString());
        }        
    }

    stop(){

    }

    pub2Redis(topic, msg){

    }

    subRedis(pattern){
        try{
            this._redisClient.psubscribe(pattern, (err, count) => {});
            this._redisClient.on("pmessage", (pattern, channel, message) => {
                // channel có dạng config:modbus:command .Trong đó: command = create|delete|modify , message = id của device
                this.#handler(channel, message);
            });
        }catch(e){

        }        
    }

    //Data handler methods
    #handler(command, id){
        //check if we recieves a create command from Interface
        if(command==config.create){
            //call PoolController to create a new ModbusTCPClient instance (Observer Pattern)
        }else if(command == config.delete){
            //call PoolController to delete a specific ModbusTCPClient instance with its id
        }else if(command == config.modify){
            //call PoolController to modify a specific ModbusTCPClient instance with its id
        }
    }

}

module.exports = RedisClient