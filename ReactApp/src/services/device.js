import http from './http-common'

const DeviceService = {
    add: data => {
        return http.post('/devices/new', data)
    },
    get: () => {
        return http.get('/devices')
    },
    getTags: (deviceID, protocol) => {
        return http.get(`/devices/${deviceID}/tags?protocol=${protocol}`)
    }
}

export default DeviceService;