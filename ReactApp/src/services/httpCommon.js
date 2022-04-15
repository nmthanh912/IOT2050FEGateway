import axios from 'axios'

const HOSTNAME = '192.168.19.153'

export const configHttp =  axios.create({
    baseURL: `http://${HOSTNAME}:4000`,
    headers: {
        'Content-type': 'application/json',
    },
})

export const modbusTCPHttp = axios.create({
    baseURL: `http://${HOSTNAME}:4001`,
    headers: {
        'Content-type': 'application/json',
    },
})

export const modbusRTUHttp = axios.create({
    baseURL: `http://${HOSTNAME}:4002`,
    headers: {
        'Content-type': 'application/json',
    },
})

export const opcuaHttp = axios.create({
    baseURL: `http://${HOSTNAME}:4004`,
    headers: {
        'Content-type': 'application/json',
    },
})

export const mqttClient = axios.create({
    baseURL: `http://${HOSTNAME}:4005`,
    headers: {
        'Content-type': 'application/json',
    },
})