import axios from 'axios'
export default axios.create({
    baseURL: 'http://192.168.137.1:4000',
    headers: {
        'Content-type': 'application/json'
    }
})