import { Button, Form, Modal } from "react-bootstrap"
import Select from "react-select"
import { useState } from "react";

export default function AddModal({ show, setShow }) {
	const [selectedDevice, setSelectedDevice] = useState(null)
	const [selectedProtocol, setSelectedProtocol] = useState(null)
	const [selectedTags, setSelectedTags] = useState(null)

	return <Modal show={show} onHide={() => setShow(false)} size='lg'>
		<Modal.Body>
			<Form>
				<div className="row mb-2">
					<Form.Group className="col-6">
						<Form.Label><b>Device</b></Form.Label>
						<Select
							defaultValue={selectedDevice}
							onChange={setSelectedDevice}
							options={devices}
							placeholder={'Device...'}

						/>
					</Form.Group>
					<Form.Group className="col-6">
						<Form.Label><b>Protocol</b></Form.Label>
						<Select
							defaultValue={selectedProtocol}
							onChange={val => {
								setSelectedProtocol(val)
								console.log(val)
							}}
							options={protocols}
							placeholder='Protocol ...'
						/>
					</Form.Group>
				</div>

				<Form.Group className="mb-2">
					<Form.Label><b>Tags</b></Form.Label>
					<Select
						defaultValue={selectedTags}
						onChange={setSelectedTags}
						options={tags}
						isMulti={true}
						placeholder='List of tags ...'
					/>
				</Form.Group>
				{selectedProtocol && <div>
					<hr />
					<h5><b>Configration Info</b></h5>
					{selectedProtocol.attr.map((colName, idx) =>
						<Form.Group className="mb-2" key={idx}>
							<Form.Label><i>{colName}</i>:</Form.Label>
							<Form.Control placeholder={colName + ' ...'} required />
						</Form.Group>
					)}
					{
						selectedDevice
						&& selectedTags
						&& <Button type="submit" className="float-end">
							Add
						</Button>
					}
				</div>}


			</Form>
		</Modal.Body>
	</Modal>
}

const protocols = [
	{
		value: 'ModbusRTU',
		label: 'ModbusRTU',
		attr: ['com_port_num', 'parity', 'slave', 'baudrate', 'stopbits', 'databits']
	},
	{
		value: 'ModbusTCP',
		label: 'ModbusTCP',
		attr: ['IP', 'port', 'slave']
	},
	{
		value: 'OPC UA',
		label: 'OPC UA',
		attr: ['URL']
	}
]
const devices = [
	{ value: 'id1', label: 'Thiết bị PLC' },
	{ value: 'id2', label: 'Thiết bị XYZ' }
];
const tags = [
	{ value: 'id1', label: 'Tag độ ẩm' },
	{ value: 'id2', label: 'Tag nhiệt độ' },
	{ value: 'id3', label: 'Tag áp suất' },
]
