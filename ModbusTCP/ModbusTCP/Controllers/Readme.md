This folder contains all classes, methods, LOGICs ... for the app

* User case 1: Reading data from device and send to Redis
[Device] -> [ModbusTCPClient] -> [DataParser] -> [RedisClient] -> [RedisBroker]


* Use case 2: Recieve config from Redis (interface publishes to Redis) for CREATE / DELETE / MODIFY Device connections
[RedisBroker] -> [PoolController] -> [ModbusTCPClient]