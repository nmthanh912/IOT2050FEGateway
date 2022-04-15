import { modbusTCPHttp, modbusRTUHttp, opcuaHttp } from './httpCommon'

const createService = (serviceHttp) => {
    return {
        poweron: (deviceID) => {
            return serviceHttp.get(`/poweron?deviceID=${deviceID}`)
        },
        shutdown(deviceID) {
            return serviceHttp.get(`/shutdown?deviceID=${deviceID}`)
        },
        getRunningDevices() {
            return serviceHttp.get(`active-list`)
        }
    }
}

class Services {
    #service
    constructor(httpObj) {
        this.#service = {}
        let keys = Object.keys(httpObj)
        keys.forEach(key => {
            this.#service[key] = createService(httpObj[key])
        })
    }
    poweron(protocolName, deviceID) {
        return this.#service[protocolName.toUpperCase()].poweron(deviceID)
    }
    shutdown(protocolName, deviceID) {
        return this.#service[protocolName.toUpperCase()].shutdown(deviceID)
    }
    getRunningDevices(protocolName) {
        return this.#service[protocolName.toUpperCase()].getRunningDevices()
    }
}

const HardwareServices = new Services({
    'MODBUSTCP': modbusTCPHttp,
    'MODBUSRTU': modbusRTUHttp,
    'OPC_UA': opcuaHttp
})
export default HardwareServices