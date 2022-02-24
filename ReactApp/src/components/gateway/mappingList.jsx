import { useState } from "react"
import { Modal } from "react-bootstrap"
import { Pencil, Trash } from "react-bootstrap-icons"

export default function MappingList() {
    const [show, setShow] = useState(false)
    return <div>
        <div className="p-2 row m-0 fst-italic">
            <div className="col-3">
                Device ID
            </div>
            <div className="col">
                Device Name
            </div>
            <div className="col-auto">
                Action
            </div>
        </div>
        <ConfigTagModal show={show} onHide={() => setShow(false)}/>
        <Device name={'Thiết bị PLC'} ID='343a40' openConfig={() => setShow(true)}/>
        <Device name={'Thiết bị PLC'} ID='343a40' openConfig={() => setShow(true)}/>
        <Device name={'Thiết bị PLC'} ID='343a40' openConfig={() => setShow(true)}/>
    </div>
}

function ConfigTagModal({show, onHide}) {
    return <Modal show={show} onHide={onHide}>
        <Modal.Header>
            asdasdasd
        </Modal.Header>
        <Modal.Body>adasdasda</Modal.Body>
    </Modal>
}

function Device({ name, ID, openConfig }) {
    return <div 
        onClick={openConfig}
        className="row p-2 m-0 mb-2 bg-white border border-1 shadow-sm rounded hover"
    >
        <div className="col-3 text-primary"><u>#{ID}</u></div>
        <div className="col">{name}</div>
        <div className="col-auto">
            <Pencil className="hover me-2" size={18}/>
            <Trash className="hover" size={18}/>
        </div>
    </div>
}