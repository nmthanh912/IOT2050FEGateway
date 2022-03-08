import axios from 'axios'
export default axios.create({
    baseURL: 'http://172.16.1.50:4000',
    headers: {
        'Content-type': 'application/json'
    }
})