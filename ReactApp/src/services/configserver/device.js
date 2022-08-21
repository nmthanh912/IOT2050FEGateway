import { configHttp } from '../httpCommon'

class DeviceService {
    add(data, repNum) {
        return configHttp.post('/devices', { data, repNum })
    }

    get() {
        return configHttp.get('/devices')
    }
    
    getConfigInfoById(deviceID, protocol) {
        return configHttp.get(`/devices/configs?id=${deviceID}&protocol=${protocol}`)
    }
    
    editDevice(deviceID, data) {
        return configHttp.put(`/devices?id=${deviceID}`, data)
    }

    deleteDevice(deviceID) {
        return configHttp.delete(`/devices?id=${deviceID}`)
    }

    getTags(deviceID, protocol) {
        return configHttp.get(`/devices/${deviceID}/tags?protocol=${protocol}`)
    }

    editTagCell(deviceID, protocol, tagName, attrName, newValue) {
        return configHttp.put(`/devices/${deviceID}/tags?protocol=${protocol}&tagName=${tagName}&attrName=${attrName}`, { newValue })
    }

    deleteTag(deviceID, tagName) {
        return configHttp.delete(`/devices/${deviceID}/tag?tagName=${tagName}`)
    }

    addTag(deviceID, protocol, data) {
        return configHttp.post(`/devices/${deviceID}/tags?protocol=${protocol}`, data)
    }
}

export default new DeviceService()
