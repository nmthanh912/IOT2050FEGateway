import { configHttp } from '../httpCommon'

class Service {
    get() {
        return configHttp.get('/gateways')
    }
    getSubcribedDevices(gatewayId) {
        return configHttp.get(`/gateways/devices?id=${gatewayId}`)
    }
    addSubscribeDevices(gatewayID, deviceIDList) {
        return configHttp.post(`/gateways/sub?`, { gatewayID, deviceIDList })
    }
    removeSubscribedDevice(gatewayId, deviceId) {
        return configHttp.delete(`/gateways/unsub?gid=${gatewayId}&did=${deviceId}`)
    }

    getSubcribedDeviceConfig(gatewayId, deviceId, protocol) {
        return configHttp.get(`/gateways/devices/config?gid=${gatewayId}&did=${deviceId}&dp=${protocol}`)
    }
    add(data) {
        return configHttp.post('/gateways/new', data)
    }
    delete(gatewayId) {
        return configHttp.delete(`/gateways/delete?id=${gatewayId}`)
    }
    update(gatewayId, data) {
        return configHttp.put(`/gateways/update?id=${gatewayId}`, data)
    }
    updateSubcribedDeviceConfig(gatewayId, deviceId, data) {
        return configHttp.put(`/gateways/${gatewayId}/${deviceId}`, data)
    }

}
const GatewayService = new Service()
export default GatewayService