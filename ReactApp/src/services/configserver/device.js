import { configHttp } from '../httpCommon'

class DeviceService {
    add(data, repNum) {
        return configHttp.post('/devices/new', { data, repNum })
    }
    get() {
        return configHttp.get('/devices')
    }
    getConfigInfoById(id, protocol) {
        return configHttp.get(`/devices/${id}/config?protocol=${protocol}`)
    }
    getTags(deviceID, protocol) {
        return configHttp.get(`/devices/${deviceID}/tags?protocol=${protocol}`)
    }
    editDevice(deviceID, data) {
        return configHttp.put(`/devices/${deviceID}/edit`, data)
    }
    deleteDevice(deviceID, protocol) {
        return configHttp.delete(`/devices/${deviceID}?protocol=${protocol}`)
    }
    editTagCell(deviceID, protocol, tagName, attr, newValue) {
        return configHttp.put(`/devices/${deviceID}/tags/edit?protocol=${protocol}&tagName=${tagName}&attr=${attr}`, { newValue })
    }
    deleteTag(deviceID, tagName) {
        return configHttp.delete(`/devices/${deviceID}/tag?tagName=${tagName}`)
    }
    addTag(deviceID, protocol, data) {
        return configHttp.post(`/devices/${deviceID}/tags/add?protocol=${protocol}`, data)
    }
}

export default new DeviceService()
