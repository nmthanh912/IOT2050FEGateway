const deviceProtocolConfig = [
	{
		value: 'MODBUSRTU',
		label: 'Modbus RTU',
		attrs: [{
			name: 'com_port_num',
			type: 'text',
		}, {
			name: 'parity',
			options: ['none', 'odd', 'even'],
		}, {
			name: 'slaveID',
			type: 'number',
		}, {
			name: 'baudrate',
			type: 'number',
		}, {
			name: 'stopbits',
			type: 'number',
		}, {
			name: 'databits',
			type: 'number',
		},],
	},
	{
		value: 'MODBUSTCP',
		label: 'Modbus TCP',
		attrs: [
			{
				name: 'IP',
				type: 'text',
			},
			{
				name: 'port',
				type: 'number',
			},
			{
				name: 'slaveID',
				type: 'number',
			},
		],
	},
	{
		value: 'OPC_UA',
		label: 'OPC UA',
		attrs: [{ name: 'URL', type: 'url' }],
	},
]

export default deviceProtocolConfig