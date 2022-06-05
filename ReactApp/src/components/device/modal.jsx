import { useEffect, useRef, useState } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'
import DeviceService from '../../services/configserver/device'
import { useDispatch } from 'react-redux'
import { addDevice, addManyDevice, updateDevice, updateTagList } from '../../redux/slices/device'
import CSVReader from './CSVImporter'
import { toast } from 'react-toastify'
import deviceProtocolConfig from '../../format/deviceProtocolConfig'

export default function DeviceModal({ show, onHide, device, mode }) {
	const [draftInfo, setDraftInfo] = useState(initState)
	const csvRef = useRef(null)
	const dispatch = useDispatch()
	const [replicateNumber, setReplicateNumber] = useState(1)
	const [disableProtocol, setDisableProtocol] = useState(false)

	const setName = (name) => setDraftInfo({ ...draftInfo, name })
	const setDescription = (description) => setDraftInfo({ ...draftInfo, description })
	const setProtocol = (value) => {
		let protocol = deviceProtocolConfig.find((p) => p.value === value)
		setDraftInfo({ ...draftInfo, protocol, config: {} })
	}
	const setConfig = (config) => setDraftInfo({ ...draftInfo, config })

	const updateToDB = async () => {
		try {
			let tagList = []
			if (device.tagList.length === 0) {
				const res1 = await DeviceService.getTags(device.ID, device.protocol)
				dispatch(
					updateTagList({
						deviceID: device.ID,
						data: res1.data,
					})
				)
				tagList = res1.data
			} else {
				tagList = device.tagList
			}

			const data = {
				...draftInfo,
				protocol: draftInfo.protocol.value.toUpperCase(),
				tagList: draftInfo.tagList.length !== 0 ? draftInfo.tagList : tagList,
			}

			await DeviceService.editDevice(device.ID, data)
			delete data.config
			delete data.protocol
			dispatch(
				updateDevice({
					ID: device.ID,
					...data,
				})
			)
			toast.success('Update device successfully')
		} catch (err) {
			toast.error(err.response.data.msg)
		}
	}

	useEffect(() => {
		if (mode === 'edit') {
			DeviceService.getConfigInfoById(device.ID, device.protocol).then((res) => {
				setDraftInfo({
					...device,
					protocol: deviceProtocolConfig.find((cInfo) => cInfo.value.toUpperCase() === device.protocol),
					config: res.data,
				})
			}).catch((err) => {
				console.log(err)
			})
		}
	}, [device, mode])

	const addDeviceToDB = () => {
		const newDevice = {
			...draftInfo,
			protocol: draftInfo.protocol.value.toUpperCase(),
		}
		let confirmDuplicate = true
		if (replicateNumber >= 5) {
			confirmDuplicate = window.confirm("Have you checked out the config infomation ?")
		}
		confirmDuplicate && DeviceService.add(newDevice, replicateNumber)
			.then((response) => {
				delete newDevice.config
				const keyList = response.data.keyList
				console.log(keyList)
				if (keyList.length === 1) {
					dispatch(addDevice({ ID: keyList[0], ...newDevice }))
				}
				else {
					let name = newDevice.name
					delete newDevice.name
					const deviceList = keyList.map((key, idx) => ({
						ID: key,
						name: name + `_${idx}`,
						...newDevice
					}))
					console.log(deviceList)
					dispatch(addManyDevice(deviceList))
				}
				response.data.keyList.length === 1 ?
					toast.success('Add a device successfully !') :
					toast.success('Add many devices successfully !')
				setDraftInfo(initState)
				setReplicateNumber(1)
				setDisableProtocol(false)
			})
			.catch((err) => {
				toast.error(err.response.data.msg)
			})
	}

	const handleUploadFile = file => {
		try {
			// Find the first line which taglist/config begin in excel file
			const tagListOffset = file.data.findIndex(val => val[0] === 'Tag List') + 1
			const configOffset = file.data.findIndex(val => val[0] === 'Configurations') + 1
			const deviceInfoOffset = file.data.findIndex(val => val[0] === 'Device Info') + 2

			// Reading file CSV is different between OS
			// In Linux, there are no empty last line in reading
			let tagListLength
			if(file.data[file.data.length - 1][0] === '') {
				// Window reading
				tagListLength = file.data.length - tagListOffset - 2
			}
			else {
				// Linux reading
				tagListLength = file.data.length - tagListOffset - 1
			}

			const removedNullData = file.data.map((row, index) => {
				let trimmedRow = row.map(cell => cell.trim())
				if (index <= deviceInfoOffset) return trimmedRow
				return trimmedRow.filter(val => val !== '')
			})

			if (mode === 'edit') {
				if (removedNullData[deviceInfoOffset][7].toLowerCase() !== draftInfo.protocol.value.toLowerCase())
					throw new Error('Protocol cannot be changed')
			}

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

			const obj = {
				name: removedNullData[deviceInfoOffset][1],
				description: removedNullData[deviceInfoOffset][2],
				byteOrder: removedNullData[deviceInfoOffset][3],
				wordOrder: removedNullData[deviceInfoOffset][4],
				scanningCycle: removedNullData[deviceInfoOffset][5],
				minRespTime: removedNullData[deviceInfoOffset][6],
				protocol: deviceProtocolConfig.find(
					(val) => val.value.toLowerCase() === removedNullData[deviceInfoOffset][7].toLowerCase()
				),
				tagList: newTagList,
				config: newConfig,
			}
			setDraftInfo(obj)
			setDisableProtocol(true)
		} catch (err) {
			toast.error(err.message)
		}
	}

	return (
		<div>
			<Modal show={show} onHide={onHide}>
				<Modal.Header className='bg-primary text-white'>
					<h5 className='m-auto'>{mode === 'add' ? 'Add new device' : 'Edit device'}</h5>
				</Modal.Header>
				<Modal.Body>
					<Form
						onSubmit={(e) => {
							e.preventDefault()
							mode === 'add' && addDeviceToDB()
							mode === 'edit' && updateToDB()
							onHide()
						}}
					>
						{/* Enter device info */}
						<div className='row mb-2'>
							<div ref={csvRef} className='mb-1'>
								<CSVReader handleUpload={handleUploadFile} />
							</div>
							<Form.Group className='col-6'>
								<Form.Label>Device name:</Form.Label>
								<Form.Control
									value={draftInfo.name}
									size='sm'
									placeholder='Device name ...'
									onChange={(e) => setName(e.target.value)}
									required
								/>
							</Form.Group>
							<Form.Group className='col-6'>
								<Form.Label>Protocol:</Form.Label>
								<Form.Select
									size='sm'
									value={draftInfo.protocol.value}
									onChange={(e) => setProtocol(e.target.value)}
									placeholder='Select protocol'
									required
									disabled={mode === 'edit' || disableProtocol}
								>
									{deviceProtocolConfig.map((protocol) => {
										return (
											<option value={protocol.value} key={protocol.value}>
												{protocol.label}
											</option>
										)
									})}
								</Form.Select>
							</Form.Group>
						</div>

						<div className='row'>
							<Form.Group className='col-6'>
								<Form.Label>Byte order:</Form.Label>

								<Form.Select
									value={draftInfo.byteOrder}
									size='sm'
									placeholder='Byte order ...'
									onChange={e => setDraftInfo({ ...draftInfo, byteOrder: e.target.value })}
									required
									disabled={draftInfo.protocol.value === "OPC_UA"}
								>
									<option value={''} disabled>
										-- Select --
									</option>
									<option value={'BigEndian'}>Big Endian</option>
									<option value={'LittleEndian'}>Little Endian</option>
								</Form.Select>
							</Form.Group>

							<Form.Group className='col-6'>
								<Form.Label>Word order:</Form.Label>
								<Form.Select
									value={draftInfo.wordOrder}
									size='sm'
									placeholder='Word order ...'
									onChange={e => setDraftInfo({ ...draftInfo, wordOrder: e.target.value })}
									required
									disabled={draftInfo.protocol.value === "OPC_UA"}
								>
									<option value={''} disabled>
										-- Select --
									</option>
									<option value={'BigEndian'}>Big Endian</option>
									<option value={'LittleEndian'}>Little Endian</option>
								</Form.Select>
							</Form.Group>
						</div>

						<div className='row'>
							<Form.Group className='col-6'>
								<Form.Label>Scanning cycle:</Form.Label>
								<Form.Control
									type='number'
									value={draftInfo.scanningCycle}
									size='sm'
									placeholder='Second ...'
									min={60}
									onChange={(e) =>
										setDraftInfo({ ...draftInfo, scanningCycle: parseInt(e.target.value) })
									}
									required
								/>
							</Form.Group>

							<Form.Group className='col-6'>
								<Form.Label>Minimum response time:</Form.Label>
								<Form.Control
									type='number'
									value={draftInfo.minRespTime}
									size='sm'
									placeholder='Milisecond ...'
									onChange={(e) =>
										setDraftInfo({ ...draftInfo, minRespTime: parseInt(e.target.value) })
									}
									required
									min={1}
								/>
							</Form.Group>
						</div>

						<Form.Group>
							<Form.Label>Description:</Form.Label>
							<Form.Control
								type='text'
								as='textarea'
								size='sm'
								placeholder='Description ...'
								value={draftInfo.description}
								onChange={(e) => setDescription(e.target.value)}
							/>
						</Form.Group>
						{mode === 'add' && (
							<Form.Group className='mt-2'>
								<Form.Label>Replicate Number:</Form.Label>
								<Form.Control
									type='number'
									size='sm'
									value={replicateNumber}
									min={1}
									onChange={e => {
										if (e.target.value === '') setReplicateNumber(0)
										else setReplicateNumber(parseInt(e.target.value))
									}}
									required
									placeholder='Default by 1'
								/>
								<Form.Text className='text-muted'>
									This number indicates how many anologous devices you want to create.
								</Form.Text>
							</Form.Group>
						)}

						{/* Enter config info */}
						<hr />
						<h5>
							<b>Configuration Info</b>
						</h5>
						{draftInfo.protocol.attrs.map((attr) => {
							const attrName = attr.name.charAt(0).toUpperCase() + attr.name.slice(1)
							const key = attrName.toLowerCase()
							return (
								<Form.Group key={attr.name} className='mb-2'>
									<Form.Label>{attrName}:</Form.Label>
									{attr.type ? (
										<Form.Control
											size='sm'
											required
											type={attr.type}
											placeholder={attrName + ' ...'}
											value={draftInfo.config[key] ? draftInfo.config[key] : ''}
											onChange={(e) => setConfig({ ...draftInfo.config, [key]: e.target.value })}
										/>
									) : (
										<Form.Select
											value={draftInfo.config[key] ? draftInfo.config[key] : ''}
											onChange={(e) => setConfig({ ...draftInfo.config, [key]: e.target.value })}
											size='sm'
											required
										>
											<option value={''} disabled>
												------
											</option>
											{attr.options.map((opt) => (
												<option value={opt} key={opt}>
													{opt}
												</option>
											))}
										</Form.Select>
									)}
								</Form.Group>
							)
						})}

						{/* Submit button */}
						<div className='d-flex justify-content-between mt-2'>
							{mode === 'edit' ?
								<div></div> :
								<Button className='outline-none text-dark' variant='outline-secondary'
									onClick={() => {
										setDraftInfo(initState)
										setDisableProtocol(false)
									}}
								>
									Clear
								</Button>
							}
							<Button className='text-white fw-bold' type='submit'>
								Submit
							</Button>
						</div>
					</Form>
				</Modal.Body>
			</Modal>
		</div>
	)
}

const initState = {
	name: '',
	description: '',
	byteOrder: '',
	wordOrder: '',
	scanningCycle: '',
	minRespTime: '',
	protocol: deviceProtocolConfig[0],
	tagList: [],
	config: {},
}
