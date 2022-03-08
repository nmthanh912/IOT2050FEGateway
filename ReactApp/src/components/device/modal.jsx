import { useEffect, useState } from "react"
import { Modal, Form, Button } from "react-bootstrap"
import DeviceService from '../../services/device'
import { useDispatch } from "react-redux"
import { addDevice } from "../../redux/slices/device"
import { updateDevice } from "../../redux/slices/device"

export default function DeviceModal({ show, onHide, mode, device }) {
	return mode === 'add' ?
		<AddModal show={show} onHide={onHide} />
		: <EditModal show={show} onHide={onHide} device={device} />
}

function AddModal({ show, onHide }) {
	const [draftInfo, setdraftInfo] = useState({
		name: '',
		description: '',
		protocol: deviceConfigInfo[0],
		config: {}
	})
	const dispatch = useDispatch()

	const setName = name => setdraftInfo({ ...draftInfo, name })
	const setDescription = description => setdraftInfo({ ...draftInfo, description })
	const setProtocol = value => {
		let protocol = deviceConfigInfo.find(p => p.value === value)
		setdraftInfo({ ...draftInfo, protocol })
	}
	const setConfig = config => setdraftInfo({ ...draftInfo, config })

	const addDeviceToDB = () => {
		const newDevice = {
			name: draftInfo.name,
			description: draftInfo.description,
			protocol: draftInfo.protocol.value,
			config: draftInfo.config
		}
		DeviceService.add(newDevice).then(response => {
			delete newDevice.config
			dispatch(addDevice({...newDevice, ID: response.data.key}))
			onHide()
		}).catch(err => {
			console.log(err)
		})
	}

	return <Modal show={show} onHide={onHide}>
		<Modal.Header className="bg-primary text-white">
			<h5 className="m-auto">Add new device</h5>
		</Modal.Header>
		<Modal.Body>
			{/* Enter device info */}
			<div className="row mb-2">
				<Form.Group className='col-6'>
					<Form.Label>Device name:</Form.Label>
					<Form.Control
						type="text" value={draftInfo.name} size="sm"
						placeholder="Device name ..."
						onChange={e => setName(e.target.value)}
						required
					/>
				</Form.Group>
				<Form.Group className='col-6'>
					<Form.Label>Protocol:</Form.Label>
					<Form.Select
						size="sm"
						value={draftInfo.protocol.value}
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
			{draftInfo.protocol.attrs.map(attr => {
				const attrName = attr.name.charAt(0).toUpperCase() + attr.name.slice(1)
				return <Form.Group key={attr.name} className='mb-2'>
					<Form.Label>{attrName}:</Form.Label>
					{attr.type ? <Form.Control
						size="sm" required type={attr.type}
						placeholder={attrName + ' ...'}
						value={draftInfo.config[attrName] ? draftInfo.config[attrName] : ''}
						onChange={e => setConfig({ ...draftInfo.config, [attrName]: e.target.value })}
					/> : <Form.Select>
						{attr.options.map(opt => <option value={opt} key={opt}>{opt}</option>)}
					</Form.Select>}
				</Form.Group>
			})}

			{/* Submit button */}
			<Button className="float-end text-white fw-bold"
				onClick={addDeviceToDB}
			>
				Submit
			</Button>
		</Modal.Body>
	</Modal>
}

function EditModal({ show, onHide, device }) {
	const [draftInfo, setDraftInfo] = useState({
		ID: '',
		name: '',
		description: '',
		protocol: deviceConfigInfo[0]
	})
	const dispatch = useDispatch()
	const [config, setConfig] = useState({})

	const setName = name => setDraftInfo({ ...draftInfo, name })
	const setDescription = description => setDraftInfo({ ...draftInfo, description })
	const setProtocol = value => {
		let protocol = deviceConfigInfo.find(p => p.value === value)
		setDraftInfo({ ...draftInfo, protocol })
		const resetConfig = {}
		protocol.attrs.forEach(attr => {
			resetConfig[attr.name] = ''
		})
		setConfig(resetConfig)
	}

	const update = () => {
		const data = {
			name: draftInfo.name,
			description: draftInfo.description,
			protocol: draftInfo.protocol.value,
			config: config
		}
		DeviceService.editDevice(device.ID, data).then(response => {
			delete data.config
			dispatch(updateDevice({
				ID: device.ID,
				...data
			}))
		}).catch(err => {
			console.log(err)
		})
	}

	useEffect(() => {
		setDraftInfo({
			ID: device.ID,
			name: device.name,
			description: device.description,
			protocol: deviceConfigInfo.find(cInfo => cInfo.value.toUpperCase() === device.protocol)
		})
		DeviceService.getConfigInfoById(device.ID, device.protocol).then(res => {
			setConfig(res.data)
		}).catch(err => {
			console.log(err)
		})
	}, [device])

	return <Modal show={show} onHide={onHide}>
		<Modal.Header className="bg-primary text-white">
			<h5 className="m-auto">Edit device #{draftInfo.ID}</h5>
		</Modal.Header>
		<Modal.Body>
			{/* Enter device info */}
			<div className="row mb-2">
				<Form.Group className='col-6'>
					<Form.Label>Device name:</Form.Label>
					<Form.Control
						type="text" value={draftInfo.name} size="sm"
						placeholder="Device name ..."
						onChange={e => setName(e.target.value)}
						required
					/>
				</Form.Group>
				<Form.Group className='col-6'>
					<Form.Label>Protocol:</Form.Label>
					<Form.Select
						size="sm"
						value={draftInfo.protocol.value}
						onChange={e => setProtocol(e.target.value)}
						placeholder='Select protocol'
						required
						disabled
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
					value={draftInfo.description}
					type="text" as="textarea" size="sm"
					placeholder="Description ..."
					onChange={e => setDescription(e.target.value)}
				/>
			</Form.Group>

			{/* Enter config info */}
			<hr />
			<h5><b>Configration Info</b></h5>
			{draftInfo.protocol.attrs.map(attr => {
				const attrName = attr.name.charAt(0).toUpperCase() + attr.name.slice(1)
				const key = attrName.toLowerCase()
				return <Form.Group key={attr.name} className='mb-2'>
					<Form.Label>{attrName}:</Form.Label>
					{attr.type ? <Form.Control
						size="sm" required
						type={attr.type}
						placeholder={attrName + ' ...'}
						value={config[key] ? config[key] : ''}
						onChange={e => setConfig({ ...config, [key]: e.target.value })}
					/> : <Form.Select
						value={config[key] ? config[key] : ''}
						onChange={e => setConfig({ ...config, [key]: e.target.value })}
					>
						{attr.options.map(opt => <option value={opt} key={opt}>{opt}</option>)}
					</Form.Select>}
				</Form.Group>
			})}

			{/* Submit button */}
			<Button className="float-end text-white fw-bold"
				onClick={update}
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
		type: 'text'
	}, {
		name: 'parity',
		options: ['', 'odd', 'even']
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