import SubHeader from "../components/subHeader";
import DeviceModal from '../components/device/modal'
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDevices } from "../redux/slices/device";
import EdgeDevice from "../components/device/device";

// const csvData = [
// 	["firstname", "lastname", "email"],
// 	["Ahmed", "Tomi", "ah@smthing.co.com"],
// 	["Raed", "Labes", "rl@smthing.co.com"],
// 	["Yezzi", "Min l3b", "ymin@cocococo.com"]
// ];

export default function DevicePage() {
	const [showAdd, setShowAdd] = useState(false)
	const [showEdit, setShowEdit] = useState(false)
	const deviceList = useSelector(state => state.device)
	const dispatch = useDispatch()
	const [currDevice, setCurrDevice] = useState(deviceList.length !== 0 ? deviceList[0] : null)

	useEffect(() => {
		dispatch(fetchDevices())
	}, [dispatch])

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
		/>
		{currDevice && <DeviceModal show={showEdit}
			onHide={() => setShowEdit(false)}
			mode='edit' device={currDevice}
		/>}
		<hr />
		{deviceList.map(device => {
			return <EdgeDevice key={device.ID} data={{ ...device }} onDetail={() => {
				setCurrDevice(device)
				setShowEdit(true)}
			}/>
		})}
	</div>
}