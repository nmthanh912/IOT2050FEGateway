import EditableText from "./EditableText";
import { X } from "react-bootstrap-icons"
import styled from "styled-components";
import { useState } from "react";

const XBtn = styled(X)`
	&:hover{
		cursor: pointer;
		color: tomato;
	}
`

const dataTypes = ['String', 'Number', 'BigInt', 'Boolean'];

export default function Attribute() {
	const [key, setKey] = useState('')
	const [value, setValue] = useState('')
	const [type, setType] = useState(dataTypes[0])

	return <div className="d-flex align-items-center justify-content-between mb-2">
		<div className="d-flex align-items-center">
			<div className="me-2">
				<EditableText text={key} setText={setKey} blank={false} />
			</div>
			{' : '}
			<div className="ms-2">
				<EditableText text={value} setText={setValue} />
			</div>
		</div>
		<div className="d-flex align-items-center">
			<select 
				className="p-1 focus-input-off border border-1 rounded border-secondary me-2" 
				value={type}
				onChange={e => setType(e.target.value)}
			>
				<option value={dataTypes[0]}>String</option>
				<option value={dataTypes[1]}>Number</option>
				<option value={dataTypes[2]}>BigInt</option>
				<option value={dataTypes[3]}>Boolean</option>
			</select>
			<XBtn size={22}/>
		</div>
	</div>
}