import React, { useState } from 'react';
import { Button, FormControl, InputGroup, Modal } from 'react-bootstrap';
import { ChevronDown, ChevronUp, Pencil, Trash } from 'react-bootstrap-icons';

function Item({ children, remove, editName }) {
	const [expand, setExpand] = useState(false);

	return <div className='mb-2'>
		{React.cloneElement(children[0], {
			expand: expand,
			setExpand: setExpand,
			remove: remove,
			editName: editName,
		})}
		{React.cloneElement(children[1], { expand: expand })}
	</div>
};

const Header = props => {
	// Extract id & name in an item element
	const itemId = props.children[0].props.children[1]
	const itemName = props.children[1].props.children

	const [name, setName] = useState(itemName)
	const [showEditBox, setShowEditBox] = useState(false)

	return <div className={'row px-1 py-2 mx-1 bg-white border border-1 ' + (props.expand ? 'rounded-top' : 'rounded')}>
		<div className='col-9'>
			{props.children}
		</div>
		<div className='col-3 d-flex justify-content-end align-items-center'>
			<Pencil
				size={18} className='hover'
				onClick={() => setShowEditBox(true)}
			/>
			<Trash
				size={18} className='ms-2 hover'
				onClick={() => props.remove(itemId)}
			/>
			{props.expand ?
				<ChevronUp
					size={18} className='ms-2 hover'
					onClick={() => props.setExpand(false)}
				/>
				: <ChevronDown
					size={18}
					className='ms-2 hover'
					onClick={() => props.setExpand(true)}
				/>
			}
			<Modal show={showEditBox} onHide={() => setShowEditBox(false)}>
				<Modal.Header closeButton>
					Edit Tag name
				</Modal.Header>
				<Modal.Body>
					<InputGroup>
						<FormControl value={name} onChange={e => setName(e.target.value)}/>
						<Button onClick={() => {
							props.editName(itemId, name)
							setShowEditBox(false)
						}}>
							Save
						</Button>
					</InputGroup>
				</Modal.Body>
			</Modal>
		</div>
	</div>;
}
Item.Header = Header

const Body = props => {
	return !props.expand ? null :
		<div className='px-3 py-2 mx-1 bg-white rounded-bottom border border-top-0'>
			{props.children}
		</div>
}
Item.Body = Body

export default Item;