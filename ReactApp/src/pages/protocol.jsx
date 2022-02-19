import { useState } from "react"
import Schema from "../components/protocol/schema"
import ShortUniqueId from "short-unique-id"
import { PlusCircleFill } from "react-bootstrap-icons"
import SchemaModal from "../components/protocol/SchemaModal"
import { useSelector } from "react-redux"

const uid = new ShortUniqueId({
	length: 3,
	dictionary: 'number'
})

export default function Protocol() {
	const schemaList = useSelector(state => state.protocol)
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
		<SchemaModal show={showBox} setShow={setShowBox}/>
	</div>
}

