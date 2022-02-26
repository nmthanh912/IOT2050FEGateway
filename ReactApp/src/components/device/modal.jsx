import { useState } from "react"
import { Modal, Form, Button } from "react-bootstrap"
import DeviceService from '../../services/device'

export default function DeviceModal({ show, onHide }) {
	const [deviceInfo, setDeviceInfo] = useState({
		name: '',
		description: '',
		protocol: deviceConfigInfo[0],
		config: {}
	})

	const setName = name => setDeviceInfo({ ...deviceInfo, name })
	const setDescription = description => setDeviceInfo({ ...deviceInfo, description })
	const setProtocol = value => {
		let protocol = deviceConfigInfo.find(p => p.value === value)
		setDeviceInfo({ ...deviceInfo, protocol })
	}
	const setConfig = config => setDeviceInfo({ ...deviceInfo, config })

	return <Modal show={show} onHide={onHide}>
		<Modal.Header className="bg-dark text-white">
			<h5 className="m-auto">Add new device</h5>
		</Modal.Header>
		<Modal.Body>
			{/* Enter device info */}
			<div className="row mb-2">
				<Form.Group className='col-6'>
					<Form.Label>Device name:</Form.Label>
					<Form.Control
						type="text" value={deviceInfo.name} size="sm"
						placeholder="Device name ..."
						onChange={e => setName(e.target.value)}
						required
					/>
				</Form.Group>
				<Form.Group className='col-6'>
					<Form.Label>Protocol:</Form.Label>
					<Form.Select
						size="sm"
						value={deviceInfo.protocol.value}
						onChange={e => setProtocol(e.target.value)}
						placeholder='Select protocol'
						required
					>
						{deviceConfigInfo.map(protocol => {
							return <option value={protocol.value} key={protocol.value}>
								{protocol.label}
							</option>
						})}
					</Form.Select>
				</Form.Group>
			</div>
			<Form.Group>
				<Form.Label>Description:</Form.Label>
				<Form.Control
					type="text" as="textarea" size="sm"
					placeholder="Description ..."
					onChange={e => setDescription(e.target.value)}
				/>
			</Form.Group>

			{/* Enter config info */}
			<hr />
			<h5><b>Configration Info</b></h5>
			{deviceInfo.protocol.attrs.map(attr => {
				const attrName = attr.name.charAt(0).toUpperCase() + attr.name.slice(1)
				return <Form.Group key={attr.name} className='mb-2'>
					<Form.Label>{attrName}:</Form.Label>
					{attr.type ? <Form.Control
						size="sm" required type={attr.type}
						placeholder={attrName + ' ...'}
						value={deviceInfo.config[attrName] ? deviceInfo.config[attrName] : ''}
						onChange={e => setConfig({ ...deviceInfo.config, [attrName]: e.target.value })}
					/> : <Form.Select>
						{attr.options.map(opt => <option value={opt} key={opt}>{opt}</option>)}
					</Form.Select>}
				</Form.Group>
			})}

			{/* Submit button */}
			<Button size="sm" className="float-end"
				onClick={() => {
					DeviceService.add({
						name: deviceInfo.name,
						description: deviceInfo.description,
						protocol: deviceInfo.protocol.value,
						config: deviceInfo.config
					})
						.then(response => console.log(response.data))
				}}
			>
				Submit
			</Button>
		</Modal.Body>
	</Modal>
}

const deviceConfigInfo = [{
	value: 'ModbusRTU',
	label: 'Modbus RTU',
	attrs: [{
		name: 'com_port_num',
		type: 'number'
	}, {
		name: 'parity',
		options: [null, 'odd', 'even']
	}, {
		name: 'slave',
		type: 'number'
	}, {
		name: 'baudrate',
		type: 'number'
	}, {
		name: 'stopbits',
		type: 'number'
	}, {
		name: 'databits',
		type: 'number'
	}]
}, {
	value: 'ModbusTCP',
	label: 'Modbus TCP',
	attrs: [{
		name: 'IP',
		type: 'text',
	}, {
		name: 'port',
		type: 'number'
	}, {
		name: 'slave',
		type: 'number'
	}]
},
{
	value: 'OPC_UA',
	label: 'OPC UA',
	attrs: [{ name: 'URL', type: 'url' }]
}]