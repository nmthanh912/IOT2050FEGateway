import { useState } from "react"
import { INT, REAL, TEXT } from "../components/protocol/datatypes"
import Schema from "../components/protocol/schema"
import ShortUniqueId from "short-unique-id"
import { PlusCircleFill } from "react-bootstrap-icons"
import { Modal, Form } from "react-bootstrap"

const uid = new ShortUniqueId({
	length: 3,
	dictionary: 'number'
})

export default function Protocol() {
	const [schemaList, setSchemaList] = useState([{
		sname: 'ModbusTCP',
		columns: [{
			colName: 'ID',
			type: INT
		}, {
			colName: 'com_port_num',
			type: INT
		}, {
			colName: 'parity',
			type: INT
		}, {
			colName: 'slave',
			type: INT
		}, {
			colName: 'baudrate',
			type: REAL
		}, {
			colName: 'stopbits',
			type: TEXT
		}, {
			colName: 'databits',
			type: TEXT
		}]
	}, {
		sname: 'OPC_UA',
		columns: [{
			colName: 'url',
			type: TEXT
		}]
	}, {
		sname: 'OPC_UA',
		columns: [{
			colName: 'url',
			type: TEXT
		}]
	}, {
		sname: 'OPC_UA',
		columns: [{
			colName: 'url',
			type: TEXT
		}]
	}])

	return <div>
		{schemaList.map(schema => <Schema schema={schema} key={uid()} />)}
		<Footer />
	</div>
}

function Footer() {

	const [showBox, setShowBox] = useState(false)
	return <div>
		<PlusCircleFill
			size={30}
			className='hover text-dark float-end shadow-lg mb-3'
			onClick={() => setShowBox(true)}
		/>
		<Modal show={showBox} onHide={() => setShowBox(false)} centered>
			<Modal.Header closeButton>
				<h5>Add new protocol</h5>
			</Modal.Header>
			<Modal.Body>
				<Form>
					<Form.Group className="mb-3">
						<Form.Label>Protocol name</Form.Label>
						<Form.Control type="text" required size="sm"/>
					</Form.Group>
					<Form.Group className="mb-3">
						<Form.Label>Protocol name</Form.Label>
						<Form.Control type="text" required size="sm"/>
					</Form.Group>

				</Form>
			</Modal.Body>
		</Modal>
	</div>
}