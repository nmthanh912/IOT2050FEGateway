import { useState } from 'react'
import { Badge } from 'react-bootstrap'
import { Trash, Pencil } from 'react-bootstrap-icons'
import MqttModal from './MqttModal'

export default function Client({ uname, pwd, ip, port }) {
    const [showModal, setShowModal] = useState(false)

    return <div className="row mx-1 px-1 py-2 mb-2 bg-white border border-1 rounded shadow-sm">
        <div className="col-3">{uname}</div>
        <div className="col-3">{pwd}</div>
        <div className="col-3">{ip}</div>
        <div className="col-1">{port}</div>
        <div className="col-2">
            <Badge bg='danger' className='float-end hover'>
                <Trash size={18}/>
            </Badge>
            <Badge bg='info' className='float-end me-2 hover'>
                <Pencil size={18} onClick={() => setShowModal(true)}/>
            </Badge>
        </div>

        <MqttModal setShow={setShowModal} show={showModal}/>
    </div>
}