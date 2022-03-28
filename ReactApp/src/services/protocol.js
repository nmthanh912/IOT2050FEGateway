import { modbusTCPHttp, modbusRTUHttp } from './httpCommon'

const createService = (serviceHttp) => {
    return {
        poweron: (deviceID) => {
            return serviceHttp.get(`/poweron?deviceID=${deviceID}`)
        },
        shutdown(deviceID) {
            return serviceHttp.get(`/shutdown?deviceID=${deviceID}`)
        }
    }
}

class Services {
    #service
    constructor(httpObj) {
        this.#service = {}
        let keys = Object.keys(httpObj)
        keys.forEach(key => {
            this.#service[key.toUpperCase()] = createService(httpObj[key])
        })
    }
    poweron(protocolName, deviceID) {
        return this.#service[protocolName.toUpperCase()].poweron(deviceID)
    }
    shutdown(protocolName, deviceID) {
        return this.#service[protocolName.toUpperCase()].shutdown(deviceID)
    }
}

const HardwareServices = new Services({
    'MODBUSTCP': modbusTCPHttp,
    'MODBUSRTU': modbusRTUHttp
})
export default HardwareServices