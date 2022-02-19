import React, { useState } from 'react';

import { ChevronDown, ChevronUp, Pencil, Trash } from 'react-bootstrap-icons';
function Item({ children, onEdit, onDelete }) {
  const [expand, setExpand] = useState(false);

  return <div className='mb-2'>
    {/* Header */}
    {React.cloneElement(children[0], {
      expand: expand,
      setExpand: setExpand,
      onEdit,
      onDelete,
    })}
    {/* Body */}
    {React.cloneElement(children[1], { expand: expand })}
  </div>
};

const Header = props => {
  return <div className={'row px-1 py-2 mx-1 bg-white border border-1 ' + (props.expand ? 'rounded-top' : 'rounded')}>
    <div className='col-9'>
      {props.children}
    </div>
    <div className='col-3 d-flex justify-content-end align-items-center'>
      {props.onEdit && <Pencil
        size={18} className='hover'
        onClick={props.onEdit}
      />}
      {props.onDelete && <Trash
        size={18} className='ms-2 hover'
        onClick={props.onDelete}
      />}
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
    </div>
  </div>;
}
Item.Header = Header

const Body = props => {
  return <div className='px-3 py-2 mx-1 bg-white rounded-bottom border border-top-0'
    style={{ display: props.expand ? 'block' : 'none' }}>
    {props.children}
  </div>
}
Item.Body = Body

export default Item;