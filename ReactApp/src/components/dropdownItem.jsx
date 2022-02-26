import React, { useState } from 'react';

import { ChevronDown, ChevronUp, Pencil, Trash, Upload, BoxArrowDown } from 'react-bootstrap-icons';
function DropdownItem({ children, onEdit, onDelete, onExport, onImport }) {
    const [expand, setExpand] = useState(false);
    const [firstClick, setFirstClick] = useState(false)

    return <div className='mb-2 bg-white'>
        {/* Header */}
        {React.cloneElement(children[0], {
            expand: expand,
            setExpand: setExpand,
            onEdit,
            onDelete,
            onExport,
            onImport,
            firstClick,
            setFirstClick
        })}
        {/* Body */}
        {React.cloneElement(children[1], { expand: expand, firstClick })}
    </div>
};

const Header = props => {
    return <div className={'row px-1 py-2 m-0 bg-white border border-1 shadow ' + (props.expand ? 'rounded-top' : 'rounded')}>
        <div className='col-9'>
            {props.children}
        </div>
        <div className='col-3 d-flex justify-content-end align-items-center'>
            {props.onImport && <Upload 
                size={18}
                className='hover'
            />}
            {props.onExport && <BoxArrowDown 
                size={18}
                className='ms-2 hover'
            />}
            {props.onEdit && <Pencil
                size={18} className='ms-2 hover'
            />}
            {props.onDelete && <Trash
                size={18} className='ms-2 hover'
            />}
            {props.expand ?
                <ChevronUp
                    size={18} className='ms-2 hover'
                    onClick={() => props.setExpand(false)}
                />
                : <ChevronDown
                    size={18}
                    className='ms-2 hover'
                    onClick={() => {
                        props.setExpand(true)
                        !props.firstClick && props.setFirstClick(true)
                    }}
                />
            }
        </div>
    </div>;
}
DropdownItem.Header = Header

const Body = props => {
    return <div className='px-3 py-2 m-0 bg-white rounded-bottom border border-top-0 shadow-sm'
        style={{ display: props.expand ? 'block' : 'none' }}>
        {props.firstClick && props.children}
    </div>
}
DropdownItem.Body = Body

export default DropdownItem;