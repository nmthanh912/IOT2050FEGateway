import DropdownItem from "../components/dropdownItem";
import GatewayModal from '../components/gateway/configModal'
import SubHeader from "../components/subHeader";
import MappingList from "../components/gateway/mappingList";
import { useState } from "react";
import { useSelector } from "react-redux";
import ShortUniqueId from "short-unique-id";

const uid = new ShortUniqueId({ length: 3 })

export default function GatewayPage() {
    const [showGatewayModal, setShowGatewayModal] = useState(false)
    const gatewayList = useSelector(state => state.gateway)
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
        {gatewayList.map(gateway => <DropdownItem key={uid()} onEdit={() => { }} onDuplicate onDelete={() => { }}>
            <DropdownItem.Header>
                <div className="row">
                    <div className="text-primary col-3"><u>#{gateway.ID}</u></div>
                    <div className="fw-bold col-4">{gateway.name}</div>
                    <div className="col-5">{gateway.protocol}</div>
                </div>
            </DropdownItem.Header>
            <DropdownItem.Body>
                <MappingList list={gateway.mapping} />
            </DropdownItem.Body>
        </DropdownItem>)}

    </div>
}

const gatewayConfigInfo = [{
    value: 'MQTTClient',
    label: 'MQTT Client',
    attrs: ['username', 'password', 'IP', 'port']
}]