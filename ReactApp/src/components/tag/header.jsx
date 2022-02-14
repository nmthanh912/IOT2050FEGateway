import { InputGroup, FormControl, Button, Modal, Form } from "react-bootstrap"
import { NodePlus, Search } from 'react-bootstrap-icons'
import { useState } from "react"
import ReactJson from "react-json-view";
import { addTag } from '../../redux/slices/tag'
import { useDispatch } from "react-redux";

export default function Header() {
	const [searchText, setSearchText] = useState('');
	const [showBox, setShowBox] = useState(false)
	const [tagName, setTagName] = useState('')
	const [attr, setAttr] = useState({})
	const dispatch = useDispatch()

	const handleAddTag = () => {
		dispatch(addTag({
			name: tagName,
			attribute: attr
		}))

		setTagName('')
		setAttr({})
	}
	const searchTagByName = (name) => {
		alert(name);
		setSearchText('')
	}

	return <div className='d-flex justify-content-between'>
		<div>
			<InputGroup>
				<InputGroup.Text>Find</InputGroup.Text>
				<FormControl
					type="text"
					placeholder="Search by tag name..."
					value={searchText}
					onChange={e => setSearchText(e.target.value)}
				/>
				<Button
					className="d-flex align-items-center"
					onClick={() => searchTagByName(searchText)}
				>
					<Search fontWeight={600} />
				</Button>
			</InputGroup>
		</div>
		<Button
			variant="dark"
			onClick={() => setShowBox(true)}
		>
			Add Tag <NodePlus />
		</Button>
		<Modal show={showBox} onHide={() => setShowBox(false)}>
			<Modal.Header className="bg-dark text-light">
				<h5 className="m-auto">Add a new tag</h5>
			</Modal.Header>
			<Modal.Body>
				<Form.Group className="mb-2">
					<Form.Label>Tag name:</Form.Label>
					<Form.Control
						type='text'
						value={tagName}
						onChange={e => setTagName(e.target.value)}
					/>
				</Form.Group>
				
				<ReactJson
					name='attribute'
					src={attr}
					iconStyle="circle"
					onEdit={edit => setAttr(edit.updated_src)}
					onDelete={del => setAttr(del.updated_src)}
					onAdd={add => setAttr(add.updated_src)}
					displayDataTypes={true}
					displayObjectSize={true}
				/>

				<Button className="float-end"
					onClick={handleAddTag}>
					Submit
				</Button>
			</Modal.Body>
		</Modal>
	</div>
}