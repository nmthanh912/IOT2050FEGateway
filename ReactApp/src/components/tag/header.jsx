import { InputGroup, FormControl, Button } from "react-bootstrap"
import { NodePlus, Search } from 'react-bootstrap-icons'
import { useState } from "react"
import ShortUniqueId from "short-unique-id";

const uid = new ShortUniqueId({ length: 7 });

export default function Header({ addItem }) {
	const [name, setName] = useState('');
	const [searchText, setSearchText] = useState('');
	const addTag = () => {
		if (name === '') {
			alert("Please type a name")
			return;
		}
		addItem(name)
		setName('')
	}
	const searchTagByName = (name) => {
		alert(name);
		setSearchText('')
	}
	return <div className='row mb-2'>
		<div className="col-4">
			<InputGroup>
				<InputGroup.Text>Add tag</InputGroup.Text>
				<FormControl
					type="text"
					placeholder="Name (required)"
					value={name}
					onChange={e => setName(e.target.value)}
				/>
				<Button
					className="d-flex align-items-center"
					onClick={addTag}
				>
					<NodePlus fontWeight={600} />
				</Button>
			</InputGroup>
		</div>

		<div className="col-8">
			<InputGroup>
				<InputGroup.Text>Find</InputGroup.Text>
				<FormControl
					type="text"
					placeholder="Search by name..."
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
	</div>
}