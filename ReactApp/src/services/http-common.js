import axios from 'axios'
export default axios.create({
    baseURL: 'http://172.16.2.80:4000',
    headers: {
        'Content-type': 'application/json'
    }
})