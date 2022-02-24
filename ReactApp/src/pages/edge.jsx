import DropdownItem from "../components/dropdownItem";
import TagList from "../components/edge/tagList";
import SubHeader from "../components/subHeader";
import DeviceModal from '../components/configModal'
import { useState } from "react";

export default function Edge({ edit }) {
    const [showDeviceModal, setShowDeviceModal] = useState(false)
    return <div>
        <SubHeader
            modal={<DeviceModal
                show={showDeviceModal}
                onHide={() => setShowDeviceModal(false)}
                formats={edgeConfigInfo}
            />}
            onShow={() => setShowDeviceModal(true)}
            title='Device'
        />

        <hr />

        <DropdownItem onEdit={edit} onExport onImport onDelete>
            <DropdownItem.Header>
                <div className="row">
                    <div className="text-primary col-3"><u>#{'12ab56f'}</u></div>
                    <div className="fw-bold col-4">Thiết bị PLC</div>
                    <div className="col-5">---------------</div>
                </div>
            </DropdownItem.Header>
            <DropdownItem.Body>
                <TagList />
            </DropdownItem.Body>
        </DropdownItem>
    </div>
}

const edgeConfigInfo = [{
    value: 'ModbusRTU',
    label: 'Modbus RTU',
    attrs: ['com_port_num', 'parity', 'slave', 'baudrate', 'stopbits', 'databits']
}, {
    value: 'ModbusTCP',
    label: 'Modbus TCP',
    attrs: ['IP', 'port', 'slave']
},
{
    value: 'OPC_UA',
    label: 'OPC UA',
    attrs: ['URL']
}]