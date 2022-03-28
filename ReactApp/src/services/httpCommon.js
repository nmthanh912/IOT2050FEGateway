import axios from 'axios'
export const configHttp =  axios.create({
    baseURL: 'http://192.168.137.1:4000',
    headers: {
        'Content-type': 'application/json'
    }
})

export const modbusTCPHttp = axios.create({
    baseURL: 'http://192.168.137.1:4001',
    headers: {
        'Content-type': 'application/json'
    }
})

export const modbusRTUHttp = axios.create({
    baseURL: 'http://localhost:4002',
    headers: {
        'Content-type': 'application/json'
    }
})