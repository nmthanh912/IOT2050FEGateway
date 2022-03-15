import SubHeader from "../components/subHeader";
import DeviceModal from '../components/device/modal'
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDevices } from "../redux/slices/device";
import EdgeDevice from "../components/device/device";

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

		{/* Edit Modal */}
		{currDevice && <DeviceModal show={showEdit}
			onHide={() => setShowEdit(false)}
			mode='edit' device={currDevice}
		/>}
		<hr />

		{/* Device List (when click in edit, trigger Edit Modal) */}
		{deviceList.map(device => {
			return <EdgeDevice key={device.ID} data={device} onDetail={() => {
				setCurrDevice(device)
				setShowEdit(true)}
			}/>
		})}
	</div>
}