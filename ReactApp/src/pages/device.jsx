import SubHeader from "../components/subHeader";
import DeviceModal from '../components/device/modal'
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import EdgeDevice from "../components/device/device";
import removeAccents from "../utils/removeAccents";
import HardwareServices from "../services/protocol";
import { toast } from "react-toastify";

export default function DevicePage() {
	const [showAdd, setShowAdd] = useState(false)
	const [showEdit, setShowEdit] = useState(false)

	const deviceList = useSelector(state => state.device)
	const [currDevice, setCurrDevice] = useState(deviceList.length !== 0 ? deviceList[0] : null)

	const [currDeviceList, setCurrDeviceList] = useState([])
	const [savedQuery, setSavedQuery] = useState('')

	const [runningDevices, setRunningDevices] = useState([])

	useEffect(() => {
		console.log("asdasd")
		let protocols = ['ModbusTCP', 'ModbusRTU', 'OPC_UA']
		const jobs = protocols.map(protocol => HardwareServices.getRunningDevices(protocol))
		Promise.allSettled(jobs).then(results => {
			let fulfilled_arr = []
			// console.log(results)
			for(let i in results) {
				if(results[i].status === 'rejected') {
					toast.error(protocols[i] + " occurs error")
				}
				else {
					fulfilled_arr = fulfilled_arr.concat(results[i].value.data)
				}
			}
			console.log(fulfilled_arr)
			setRunningDevices(fulfilled_arr)
		})
	}, [])


	useEffect(() => {
		if (savedQuery === '') setCurrDeviceList(deviceList)
	}, [deviceList, savedQuery])

	const searchDevice = query => {
		let arr = deviceList.filter(val => {
			const searchStr = removeAccents(query).toLowerCase()
			const normalDeviceName = removeAccents(val.name).toLowerCase()
			return normalDeviceName.match(searchStr)
		})
		setSavedQuery(query)
		setCurrDeviceList(arr)
	}

	return <div>
		<SubHeader
			modal={<DeviceModal
				show={showAdd}
				onHide={() => setShowAdd(false)}
				mode='add'
			/>}
			onShow={() => setShowAdd(true)}
			onSubmit
			title='Device'
			onSearch={searchDevice}
		/>

		{/* Edit Modal */}
		{currDevice && <DeviceModal show={showEdit}
			onHide={() => setShowEdit(false)}
			mode='edit' device={currDevice}
		/>}
		<hr />

		{/* Device List (when click in edit, trigger Edit Modal) */}
		{currDeviceList.length !== 0 ? currDeviceList.map(device => {
			return <EdgeDevice
				key={device.ID} data={device}
				onDetail={() => {
					setCurrDevice(device)
					setShowEdit(true)
				}}
				isRunning={runningDevices.includes(device.ID)}
			/>
		}) : <div className='w-100 d-flex justify-content-between'>
			<div className='mx-auto text-secondary mt-5 fs-3'>
				Empty device list
			</div>
		</div>}
	</div>
}