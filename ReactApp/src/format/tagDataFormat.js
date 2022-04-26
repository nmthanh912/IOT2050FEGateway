const tagDataFormats = [{
    protocol: 'MODBUSRTU',
    attrs: [{
        type: 'text',
        name: 'name'
    }, {
        type: 'number',
        name: 'address'
    }, {
        type: 'text',
        name: 'unit'
    }, {
        type: 'select',
        name: 'dataType',
        options: ['int16', 'uint16', 'float32', 'int32', 'uint32', 'double', 'string']
    }, {
        type: 'number',
        name: 'PF',
    }, {
        type: 'number',
        name: 'size',
    }]
}, {
    protocol: 'MODBUSTCP',
    attrs: [{
        type: 'text',
        name: 'name'
    }, {
        type: 'number',
        name: 'address'
    }, {
        type: 'text',
        name: 'unit'
    }, {
        type: 'select',
        name: 'dataType',
        options: ['int16', 'uint16', 'float32', 'int32', 'uint32', 'double', 'string']
    }, {
        type: 'number',
        name: 'PF',
    }, {
        type: 'number',
        name: 'size',
    }]
}, {
    protocol: 'OPC_UA',
    attrs: [{
        type: 'text',
        name: 'name',
    }, {
        type: 'text',
        name: 'nodeid',
    }, {
        type: 'text',
        name: 'unit',
    }]
}]

export default tagDataFormats