import { Accordion } from "react-bootstrap"
import AttributeList from "../components/tag/AttributeList"
import ShortUniqueId from "short-unique-id";
import { useState } from 'react'

const uid = new ShortUniqueId({ length: 7 });
const dataTypes = ['String', 'Number', 'BigInt', 'Boolean'];

export default function Tag() {
	const [list, setList] = useState([
		{
			id: uid(),
			name: 'Tag đo nhiệt độ',
			attrList: {}
		},
		{
			id: uid(),
			name: 'Tag đo nồng độ CO2',
			attrList: [{
				id: uid(),
				key: 'value',
				value: 102,
				dataType: dataTypes[0]
			}]
		}
	])

	return <div>
		<Accordion>
			{list.map((item, index) => { 
				return <Accordion.Item eventKey={index} key={index}>
					<Accordion.Header>
						<u className="text-primary me-5">#{item.id}</u>
						<b>{item.name}</b>
					</Accordion.Header>
					<Accordion.Body className="py-2">
						<AttributeList />
					</Accordion.Body>
				</Accordion.Item>
			})}
		</Accordion>
	</div>
}