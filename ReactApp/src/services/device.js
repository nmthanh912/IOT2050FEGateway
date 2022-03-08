import http from './http-common'

class DeviceService {
    add(data) {
        return http.post('/devices/new', data)
    }
    get() {
        return http.get('/devices')
    }
    getConfigInfoById(id, protocol) {
        return http.get(`/devices/${id}/config?protocol=${protocol}`)
    }
    getTags(deviceID, protocol) {
        return http.get(`/devices/${deviceID}/tags?protocol=${protocol}`)
    }
    editDevice(deviceID, data) {
        return http.put(`/devices/${deviceID}/edit`, data)
    }
    deleteDevice(deviceID, protocol) {
        return http.delete(`/devices/${deviceID}?protocol=${protocol}`)
    }
}

export default new DeviceService();