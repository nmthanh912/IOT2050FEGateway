import DropdownItem from "../components/dropdownItem";
import TagList from "../components/device/tagList";
import SubHeader from "../components/subHeader";
import DeviceModal from '../components/device/modal'
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDevices } from "../redux/slices/device";
import { CSVLink, CSVDownload } from "react-csv";

const csvData = [
	["firstname", "lastname", "email"],
	["Ahmed", "Tomi", "ah@smthing.co.com"],
	["Raed", "Labes", "rl@smthing.co.com"],
	["Yezzi", "Min l3b", "ymin@cocococo.com"]
];
;

export default function DevicePage({ edit }) {
	const [showDeviceModal, setShowDeviceModal] = useState(false)
	const deviceList = useSelector(state => state.device)
	const dispatch = useDispatch()

	useEffect(() => {
		dispatch(fetchDevices())
	}, [dispatch])

	return <div>
		<CSVLink data={csvData}>Download me</CSVLink>

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
			return <DropdownItem onEdit={edit} onExport onImport onDelete key={device.ID}>
				<DropdownItem.Header>
					<div className="row">
						<div className="text-primary col-3"><u>#{device.ID}</u></div>
						<div className="fw-bold col-4">{device.name}</div>
						<div className="col-5">{device.protocol}</div>
					</div>
				</DropdownItem.Header>
				<DropdownItem.Body>
					<TagList deviceID={device.ID} protocol={device.protocol} />
				</DropdownItem.Body>
			</DropdownItem>
		})}
	</div>
}