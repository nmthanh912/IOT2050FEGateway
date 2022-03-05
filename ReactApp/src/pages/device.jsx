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
	const [showDeviceModal, setShowDeviceModal] = useState(false)
	const deviceList = useSelector(state => state.device)
	const dispatch = useDispatch()

	useEffect(() => {
		dispatch(fetchDevices())
	}, [dispatch])

	return <div>
		{/* <CSVLink data={csvData}>Download me</CSVLink> */}

		{/* <CSVDownload data={csvData} target="_blank" /> */}
		<SubHeader
			modal={<DeviceModal
				show={showDeviceModal}
				onHide={() => setShowDeviceModal(false)}
			/>}
			onShow={() => setShowDeviceModal(true)}
			onSubmit
			title='Device'
		/>

		<hr />
		{deviceList.map(device => {
			return <EdgeDevice key={device.ID} data={{...device}}/>
		})}
	</div>
}