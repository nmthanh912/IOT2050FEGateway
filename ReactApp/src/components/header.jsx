import { Button, FormControl, FormGroup, FormSelect, InputGroup } from 'react-bootstrap'
import { Search, NodePlus } from 'react-bootstrap-icons'
import { useState } from 'react'
import DeviceModal from './deviceModal'

export default function Header() {
    const [showDeviceModal, setShowDeviceModal] = useState(false)

    return <div className="row mt-3">
        <FormGroup className='col-9'>
            <InputGroup>
                <FormControl type='text' placeholder=' Search by name ...' />
                <Button><Search /></Button>
            </InputGroup>
        </FormGroup>
        <FormGroup className='col-3 d-flex'>
            <FormSelect>
                <option>All</option>
                <option>ModbusTCP</option>
                <option>ModbusRTU</option>
                <option>OPC UA</option>
                <option>MQTT Client</option>
            </FormSelect>
            <Button className='ms-2' onClick={() => setShowDeviceModal(true)}>
                <NodePlus size={25}/>
            </Button>
        </FormGroup>
        <DeviceModal show={showDeviceModal} setShow={setShowDeviceModal}/>
    </div>
}