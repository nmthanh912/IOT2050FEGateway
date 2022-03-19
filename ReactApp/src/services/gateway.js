import http from './http-common'

class Service {
    get() {
        return http.get('/gateways')
    }

    getSubcribedDevices(gatewayId) {
        return http.get(`/gateways/devices?id=${gatewayId}`)
    }
    addSubscribeDevice(gatewayID, deviceID) {
        return http.post(`/gateways/device/add?`, { gatewayID, deviceID })
    }
    removeSubscribedDevice(gatewayId, deviceId) {
        return http.delete(`/gateways/device/delete?gid=${gatewayId}&did=${deviceId}`)
    }

    getSubcribedDeviceConfig(gatewayId, deviceId, protocol) {
        return http.get(`/gateways/devices/config?gid=${gatewayId}&did=${deviceId}&dp=${protocol}`)
    }
    add(data) {
        return http.post('/gateways/new', data)
    }
    delete(gatewayId) {
        return http.delete(`/gateways/delete?id=${gatewayId}`)
    }
    update(gatewayId, data) {
        return http.put(`/gateways/update?id=${gatewayId}`, data)
    }
    updateSubcribedDeviceConfig(gatewayId, deviceId, data) {
        return http.put(`/gateways/${gatewayId}/${deviceId}`, data)
    }

}
const GatewayService = new Service()
export default GatewayService