import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Pencil, Trash, BoxArrowDown } from 'react-bootstrap-icons';

function DropdownItem({ children, onEdit, onDelete, onExport }) {
    const [expand, setExpand] = useState(false);
    const [firstClick, setFirstClick] = useState(false)

    return <div className='mb-2'>
        {React.cloneElement(children[0], {
            expand: expand,
            setExpand: setExpand,
            onEdit,
            onDelete,
            onExport,
            // onImport,
            firstClick,
            setFirstClick
        })}
        {React.cloneElement(children[1], { expand: expand, firstClick })}
    </div>
};

const Header = props => {
    return <div className={'row bg-white px-2 py-3 m-0 border border-1 shadow ' + (props.expand ? 'rounded-top-custom' : 'rounded-custom')}>
        <div className='col-9'>
            {props.children}
        </div>
        <div className='col-3 d-flex justify-content-end align-items-center'>
            {/* {props.onImport && <Upload 
                size={18}
                className='hover'
                onClick={() => props.onImport()}
            />} */}
            {props.onExport && <BoxArrowDown 
                size={18}
                className='ms-2 hover'
                onClick={() => props.onExport()}
            />}
            {props.onEdit && <Pencil
                size={18} 
                className='ms-2 hover'
                onClick={() => props.onEdit()}
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
    return <div className='m-0 bg-white rounded-bottom-custom border border-top-0 shadow'
        style={{ display: props.expand ? 'block' : 'none' }}>
        {props.firstClick && props.children}
    </div>
}
DropdownItem.Body = Body

export default DropdownItem;