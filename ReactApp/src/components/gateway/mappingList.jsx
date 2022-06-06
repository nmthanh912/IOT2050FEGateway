import { useState, useEffect, useMemo } from "react"
import { Trash, PlusCircle } from "react-bootstrap-icons"
import { Button, Form, Modal } from "react-bootstrap"
import TagModal from "./tagModal"
import GatewayService from '../../services/configserver/gateway'
import { removeAccentsWithUnderscore } from "../../utils/removeAccents"
import { useSelector } from "react-redux"
import Select from 'react-select'
import { toast } from "react-toastify"


export default function MappingList({ gatewayID, name, editable }) {
	const allDeviceData = useSelector(state => state.device)

	const [showTagModal, setShowTagModal] = useState(false)
	// Current device's data for configuring tags (use on opening modal)
	const [configuringDevice, setConfiguringDevice] = useState(null)
	// For render subscribed devices
	const [deviceList, setDeviceList] = useState([])
	const [showSubscribeModal, setShowSubscribeModal] = useState(false)

	const [inputSubList, setInputSubList] = useState([])

	const restDevices = useMemo(() => {
		let allDeviceBasic = allDeviceData.map(val => ({
			ID: val.ID,
			name: val.name
		}))
		let rest = allDeviceBasic.filter(val => {
			return !deviceList.some(device => device.ID === val.ID)
		})
		return rest
	}, [allDeviceData, deviceList])

	useEffect(() => {
		GatewayService.getSubcribedDevices(gatewayID).then(response => {
			setDeviceList(response.data)
		}).catch(err => {
			console.log(err.response.data)
			toast.err(err)
		})
	}, [gatewayID])

	const openTagModal = device => {
		GatewayService.getSubcribedDeviceConfig(gatewayID, device.ID, device.protocol)
			.then(response => {
				setConfiguringDevice({
					...device,
					tagList: response.data.tagList,
					code: response.data.code,
					toggle: response.data.toggle
				})
				console.log(response.data)
			})
			.catch(err => console.log(err))
		setShowTagModal(true)
	}

	const addSubscribeDevices = () => {
		const subDeviceIDlist = inputSubList.map(sub => sub.value)
		GatewayService.addSubscribeDevices(gatewayID, subDeviceIDlist).then(response => {
			setInputSubList([])
			console.log(response.data)

			let subList = allDeviceData.filter(val => {
				return subDeviceIDlist.some(ID => val.ID === ID)
			}).map(val => ({ ID: val.ID, name: val.name, protocol: val.protocol }))
			console.log(subList)

			setDeviceList([...deviceList, ...subList])
			setShowSubscribeModal(false)
		})
	}

	const removeSubscribedDevice = deviceID => {
		GatewayService.removeSubscribedDevice(gatewayID, deviceID).then(response => {
			console.log(response.data)
			let newDeviceList = [...deviceList]
			let idx = newDeviceList.findIndex(val => val.ID === deviceID)
			newDeviceList.splice(idx, 1)
			setDeviceList(newDeviceList)
		}).catch(err => console.log(err))
	}

	return <div className="mt-0">
		<table className="styled-table w-100" >
			<thead>
				<tr>
					<th>Device ID</th>
					<th>Device Name</th>
					{editable && <th className="text-end">Action</th>}
				</tr>
			</thead>
			<tbody>
				{deviceList.map(device => <Device
					key={device.ID}
					ID={device.ID}
					name={device.name}
					openConfig={() => openTagModal(device)}
					removeSubscribe={() => removeSubscribedDevice(device.ID)}
					editable={editable}
				/>)}
			</tbody>
		</table>

		{configuringDevice !== null && configuringDevice.tagList &&
			<TagModal
				show={showTagModal} onHide={() => {
					setShowTagModal(false)
					setConfiguringDevice(null)
				}}
				tagList={configuringDevice.tagList}
				deviceID={configuringDevice.ID}
				gatewayID={gatewayID}
				prefixTopic={'/iot2050fe/' + removeAccentsWithUnderscore(configuringDevice.name)}
				configCode={configuringDevice.code}
				toggleCustom={configuringDevice.toggle}
			/>
		}

		<div className="d-flex justify-content-end m-2">
			<Button className="text-white d-flex align-items-center" size="sm"
				onClick={() => setShowSubscribeModal(true)}
				disabled={restDevices.length === 0 || !editable}
			>
				Subscribe
				<PlusCircle size={18} className='ms-1' />
			</Button>
		</div>

		<Modal show={showSubscribeModal} onHide={() => setShowSubscribeModal(false)} size="lg">
			<Modal.Header className="bg-primary text-white">
				<h5 className="m-auto">Gateway '{name}' subscribes devices</h5>
			</Modal.Header>
			<Modal.Body>
				<Form.Group className="d-flex align-items-center">
					<Select
						options={restDevices.map(device => ({
							value: device.ID,
							label: device.name
						}))}
						className='w-100'
						isMulti
						value={inputSubList}
						onChange={selectedOptions => setInputSubList(selectedOptions)}
					/>
					<Button
						variant="primary" className="text-white ms-2"
						disabled={inputSubList.length === 0}
						onClick={addSubscribeDevices}
					>
						Add
					</Button>
					
				</Form.Group>
			</Modal.Body>
		</Modal>
	</div>
}

function Device({ name, ID, openConfig, removeSubscribe, editable }) {
	return <tr
		onClick={editable ? openConfig : () => { }}
		className='hover'
	>
		<td className="text-primary"><u>#{ID}</u></td>
		<td>{name}</td>
		{editable && <td className="text-end">
			<Trash className="hover" size={18}
				onClick={e => {
					e.stopPropagation()
					removeSubscribe()
				}}
			/>
		</td>}
		
	</tr>
}