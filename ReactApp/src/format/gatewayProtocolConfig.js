const gatewayProtocol = [{
    value: 'MQTT_Client',
    label: 'MQTT Client',
    attrs: [{
        name: 'username',
        type: 'text'
    }, {
        name: 'password',
        type: 'pass'
    }, {
        name: 'IP',
        type: 'text'
    }, {
        name: 'port',
        type: 'number'
    }, {
        name: 'QoS',
        type: 'select',
        options: [0, 1, 2]
    }]
}]

export default gatewayProtocol