import axios from 'axios'

const HOST = window.location.hostname

export const configHttp =  axios.create({
    baseURL: `http://${HOST}:4000`,
    headers: {
        'Content-type': 'application/json',
    },
})

export const modbusTCPHttp = axios.create({
    baseURL: `http://${HOST}:4001`,
    headers: {
        'Content-type': 'application/json',
    },
})

export const modbusRTUHttp = axios.create({
    baseURL: `http://${HOST}:4002`,
    headers: {
        'Content-type': 'application/json',
    },
})

export const opcuaHttp = axios.create({
    baseURL: `http://${HOST}:4004`,
    headers: {
        'Content-type': 'application/json',
    },
})

export const mqttClient = axios.create({
    baseURL: `http://${HOST}:4005`,
    headers: {
        'Content-type': 'application/json',
    },
})