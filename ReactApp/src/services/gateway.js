import { mqttClient } from "./httpCommon";

class MQTTClient {
    getRunningGateways() {
        return mqttClient.get('/active-gateways')
    }
    poweron(mqttID) {
        return mqttClient.get(`/poweron?mqttID=${mqttID}`)
    }
    shutdown(mqttID) {
        return mqttClient.get(`/shutdown?mqttID=${mqttID}`)
    }
}

export default new MQTTClient()