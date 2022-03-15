import http from './http-common'

class Service {
    get() {
        return http.get('/gateways')
    }
    getSubcribedDevices(gatewayId) {
        return http.get(`/gateways/devices?id=${gatewayId}`)
    }
    getSubcribedDeviceTags(gatewayId, deviceId) {
        return http.get(`/gateways/${gatewayId}/devices/${deviceId}/tags`)
    }
    add(data) {
        return http.post('/gateways/new', data)
    }
    delete(gatewayId) {
        return http.get(`/gateways/${gatewayId}`)
    }
    updateConfig(data) {
        return http.put('/gateways/new', data)
    }
    updateSubcribes(gatewayId, deviceId, data) {
        return http.put(`/gateways/${gatewayId}/devices/${deviceId}`, data)
    }
}
const GatewayService = new Service()
export default GatewayService