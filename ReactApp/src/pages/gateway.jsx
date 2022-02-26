import DropdownItem from "../components/dropdownItem";
import GatewayModal from '../components/configModal'
import SubHeader from "../components/subHeader";
import MappingList from "../components/gateway/mappingList";
import { useState } from "react";

export default function GatewayPage() {
    const [showGatewayModal, setShowGatewayModal] = useState(false)
    return <div>
        <SubHeader
            modal={<GatewayModal
                show={showGatewayModal}
                onHide={() => setShowGatewayModal(false)}
                formats={gatewayConfigInfo}
            />}
            onShow={() => setShowGatewayModal(true)}
            title='Gateway'
        />
        <hr />
        <DropdownItem onEdit={() => { }} onDuplicate onDelete={() => { }}>
            <DropdownItem.Header>
                <div className="row">
                    <div className="text-primary col-3"><u>#{'12ab56f'}</u></div>
                    <div className="fw-bold col-4">Gateway A</div>
                    <div className="col-5"> MQTT Client </div>
                </div>
            </DropdownItem.Header>
            <DropdownItem.Body>
                <MappingList />
            </DropdownItem.Body>
        </DropdownItem>
        <DropdownItem onEdit={() => { }} onDuplicate onDelete={() => { }}>
            <DropdownItem.Header>
                <div className="row">
                    <div className="text-primary col-3"><u>#{'12ab56f'}</u></div>
                    <div className="fw-bold col-4">Gateway A</div>
                    <div className="col-5"> MQTT Client </div>
                </div>
            </DropdownItem.Header>
            <DropdownItem.Body>
                <MappingList />
            </DropdownItem.Body>
        </DropdownItem>
    </div>
}

const gatewayConfigInfo = [{
    value: 'MQTTClient',
    label: 'MQTT Client',
    attrs: ['username', 'password', 'IP', 'port']
}]