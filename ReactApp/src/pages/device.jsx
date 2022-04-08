import SubHeader from "../components/subHeader";
import DeviceModal from '../components/device/modal'
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import EdgeDevice from "../components/device/device";
import removeAccents from "../utils/removeAccents";

export default function DevicePage() {
	const [showAdd, setShowAdd] = useState(false)
	const [showEdit, setShowEdit] = useState(false)

	const deviceList = useSelector(state => state.device)
	const [currDevice, setCurrDevice] = useState(deviceList.length !== 0 ? deviceList[0] : null)

	const [currDeviceList, setCurrDeviceList] = useState([])
	const [savedQuery, setSavedQuery] = useState('')

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
		{currDeviceList.map(device => {
			return <EdgeDevice key={device.ID} data={device} onDetail={() => {
				setCurrDevice(device)
				setShowEdit(true)
			}
			} />
		})}
	</div>
}