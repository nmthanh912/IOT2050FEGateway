import { useEffect, useRef, useState } from "react"
import { Modal, Form, Button } from "react-bootstrap"
import DeviceService from '../../services/device'
import { useDispatch } from "react-redux"
import { addDevice } from "../../redux/slices/device"
import { updateDevice } from "../../redux/slices/device"
import CSVReader from "./CSVImporter"

export default function DeviceModal({ show, onHide, mode, device }) {
	return mode === 'add' ?
		<AddModal show={show} onHide={onHide} />
		: <EditModal show={show} onHide={onHide} device={device} />
}

function AddModal({ show, onHide }) {
	const [draftInfo, setDraftInfo] = useState({
		name: '',
		description: '',
		protocol: deviceConfigInfo[0],
		tagList: [],
		config: {}
	})
	const csvRef = useRef(null)
	const dispatch = useDispatch()

	const setName = name => setDraftInfo({ ...draftInfo, name })
	const setDescription = description => setDraftInfo({ ...draftInfo, description })
	const setProtocol = value => {
		let protocol = deviceConfigInfo.find(p => p.value === value)
		setDraftInfo({ ...draftInfo, protocol })
		// const resetConfig = {}
		// protocol.attrs.forEach(attr => {
		// 	resetConfig[attr.name] = ''
		// })
		// setConfig(resetConfig)
	}
	const setConfig = config => setDraftInfo({ ...draftInfo, config })

	const addDeviceToDB = () => {
		const newDevice = {
			name: draftInfo.name,
			description: draftInfo.description,
			protocol: draftInfo.protocol.value,
			tagList: draftInfo.tagList,
			config: draftInfo.config
		}
		DeviceService.add(newDevice).then(response => {
			delete newDevice.config
			dispatch(addDevice({ ...newDevice, ID: response.data.key }))
			onHide()
		}).catch(err => {
			console.log(err)
		})
	}

	const handleUploadFile = file => {
		const removedNullData = file.data.map(row => row.filter(val => val !== ''))
		// console.log(removedNullData)

		// Find the first line which taglist/config begin in excel file
		const tagListOffset = removedNullData.findIndex(val => val[0] === 'Tag List') + 1
		const configOffset = removedNullData.findIndex(val => val[0] === 'Configurations') + 1

		const tagListLength = configOffset - tagListOffset - 3

		const newTagList = []
		for (let i = 0; i < tagListLength; ++i) {
			let tag = {}
			for (let j in removedNullData[tagListOffset]) {
				tag[removedNullData[tagListOffset][j]] = removedNullData[tagListOffset + i + 1][j]
			}
			newTagList.push(tag)
		}

		const newConfig = {}
		for (let i in removedNullData[configOffset]) {
			newConfig[removedNullData[configOffset][i]] = removedNullData[configOffset + 1][i]
		}
		
		// console.log({
		// 	name: removedNullData[1][1],
		// 	description: removedNullData[1][2],
		// 	protocol: deviceConfigInfo.find(val => val.value.toLowerCase() === removedNullData[1][3].toLowerCase()),
		// 	tagList: newTagList,
		// 	config: newConfig
		// })
		setDraftInfo({
			name: removedNullData[1][1],
			description: removedNullData[1][2],
			protocol: deviceConfigInfo.find(val => val.value.toLowerCase() === removedNullData[1][3].toLowerCase()),
			tagList: newTagList,
			config: newConfig
		})
	}

	return <Modal show={show} onHide={onHide}>
		<Modal.Header className="bg-primary text-white">
			<h5 className="m-auto">Add new device</h5>
		</Modal.Header>
		<Modal.Body>
			{/* Enter device info */}
			<div className="row mb-2">
				<div ref={csvRef}>
					<CSVReader handleUpload={handleUploadFile} />
				</div>
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
					placeholder="Description ..." value={draftInfo.description}
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
						size="sm" required type={attr.type}
						placeholder={attrName + ' ...'}
						value={draftInfo.config[key] ? draftInfo.config[key] : ''}
						onChange={e => setConfig({ ...draftInfo.config, [key]: e.target.value })}
					/>
						: <Form.Select
							value={draftInfo.config[key] ? draftInfo.config[key] : ''}
							onChange={e => setConfig({ ...draftInfo.config, [key]: e.target.value })}
							size='sm'
						>
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
		// console.log(data)
		DeviceService.editDevice(device.ID, data).then(response => {
			console.log(response.data)
			delete data.config
			delete data.protocol
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
			console.log(res.data)
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
					/> : <Form.Select size='sm'
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
		name: 'slaveID',
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
		name: 'slaveID',
		type: 'number'
	}]
},
{
	value: 'OPC_UA',
	label: 'OPC UA',
	attrs: [{ name: 'URL', type: 'url' }]
}]