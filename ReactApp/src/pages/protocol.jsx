import { useState } from "react"
import { INT, REAL, TEXT } from "../components/protocol/datatypes"
import Schema from "../components/protocol/schema"
import ShortUniqueId from "short-unique-id"
import { PlusCircleFill } from "react-bootstrap-icons"
import AddModal from "../components/protocol/modal"

const uid = new ShortUniqueId({
	length: 3,
	dictionary: 'number'
})

export default function Protocol() {
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
		<AddModal show={showBox} setShow={setShowBox}/>
	</div>
}

const schemaList = [{
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
}]