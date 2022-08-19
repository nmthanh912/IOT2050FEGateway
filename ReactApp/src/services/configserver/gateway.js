import { configHttp } from '../httpCommon'

class Service {
    get() {
        return configHttp.get('/gateways')
    }
    add(data) {
        return configHttp.post('/gateways', data)
    }
    delete(gatewayId) {
        return configHttp.delete(`/gateways?id=${gatewayId}`)
    }
    update(gatewayId, data) {
        return configHttp.put(`/gateways?id=${gatewayId}`, data)
    }

    getSubcribedDevices(gatewayId) {
        return configHttp.get(`/gateways/subscribes?gatewayId=${gatewayId}`)
    }
    removeSubscribedDevice(gatewayId, deviceId) {
        return configHttp.delete(`/gateways/subscribes?gatewayId=${gatewayId}&deviceId=${deviceId}`)
    }
    addSubscribeDevices(gatewayId, deviceIdList) {
        return configHttp.post(`/gateways/subscribes?`, { gatewayId, deviceIdList })
    }

    updateSubcribedDeviceConfig(gatewayId, deviceId, data) {
        return configHttp.put(`/gateways/subscribes/config?gatewayId=${gatewayId}&deviceId=${deviceId}`, data)
    }
    getSubcribedDeviceConfig(gatewayId, deviceId, protocol) {
        return configHttp.get(`/gateways/subscribes/config?gatewayId=${gatewayId}&deviceId=${deviceId}&deviceProtocol=${protocol}`)
    }
}
const GatewayService = new Service()
export default GatewayService