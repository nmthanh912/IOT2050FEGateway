import DropdownItem from "../components/dropdownItem";
import GatewayModal from '../components/gateway/configModal'
import SubHeader from "../components/subHeader";
import MappingList from "../components/gateway/mappingList";
import { useEffect, useState } from "react";
import ShortUniqueId from "short-unique-id";
import GatewayService from "../services/gateway";
import { useSelector, useDispatch } from 'react-redux'

const uid = new ShortUniqueId({ length: 3 })

const initData = [{
    ID: '36a157a5',
    name: 'Gateway A',
    protocol: 'MQTT Client',
    config: {}
}]

export default function GatewayPage() {
    const deviceList = useSelector(state => state.device)
    const [showGatewayModal, setShowGatewayModal] = useState(false)

    const dispatch = useDispatch()
    const [list, setList] = useState([])
    useEffect(() => {
        // if (deviceList.length === 0) dispatch(fetchDevices())
        GatewayService.get().then(response => {
            console.log(response.data)
        })
        setList(initData)
    }, [dispatch, deviceList])

    return <div>
        <SubHeader
            modal={<GatewayModal
                show={showGatewayModal}
                onHide={() => setShowGatewayModal(false)}
            />}
            onShow={() => setShowGatewayModal(true)}
            title='Gateway'
        />
        <hr />

        {list.map(gateway => <DropdownItem key={uid()} onEdit={() => { }} onDelete={() => { }}>
            <DropdownItem.Header>
                <div className="row">
                    <div className="text-primary col-3"><u>#{gateway.ID}</u></div>
                    <div className="fw-bold col-4">{gateway.name}</div>
                    <div className="col-5">{gateway.protocol}</div>
                </div>
            </DropdownItem.Header>
            <DropdownItem.Body>
                <MappingList gatewayID={gateway.ID} />
            </DropdownItem.Body>
        </DropdownItem>)}
    </div>
}
