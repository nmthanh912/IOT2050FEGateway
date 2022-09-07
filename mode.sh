#!/bin/bash

PROD_DATABASE_PATH="./Database/database.db"
DEV_DATABASE_PATH="../Database/database.db"

PROD_REDIS_HOST="redis"
DEV_REDIS_HOST="127.0.0.1"

PROD_CUSTOM_JSON_PATH="./customJSON"
DEV_CUSTOM_JSON_PATH="../customJSON"

PROD_DEVICE_ON_PATH="./deviceStates"
DEV_DEVICE_ON_PATH="../deviceStates"



switch_mode() {
    for folder in "NodejsApp" "OPC_UA" "MQTTClient" "ModbusTCP" "ModbusRTU" "Logger"; 
    do
        echo "DB_PATH=""$1""" > "./""$folder""/.env"
        echo "REDIS_HOST=""$2""" >> "./""$folder""/.env"
        echo "CUSTOM_JSON_PATH=""$3""" >> "./""$folder""/.env"
        echo "DEVICE_ON_PATH=""$4""" >> "./""$folder""/.env"
    done
}

if [ "$1" = "production" ]
then
    switch_mode $PROD_DATABASE_PATH $PROD_REDIS_HOST $PROD_CUSTOM_JSON_PATH $PROD_DEVICE_ON_PATH
elif [ "$1" = "development" ]
then
    switch_mode $DEV_DATABASE_PATH $DEV_REDIS_HOST $DEV_CUSTOM_JSON_PATH $DEV_DEVICE_ON_PATH
else
    echo "Incorrect mode !"
    echo "Evironment must be \"development\" or \"production\"." 
fi