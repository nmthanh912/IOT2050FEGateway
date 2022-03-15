import { useState, useEffect } from "react"
import { Pencil, Trash } from "react-bootstrap-icons"
import ConfigTagModal from "./configTagModal"
import GatewayService from '../../services/gateway'

export default function MappingList({ gatewayID }) {
    const [show, setShow] = useState(false)
    const [configDevice, setConfigDevice] = useState(null)
    const [deviceList, setDeviceList] = useState([])

    useEffect(() => {
        GatewayService.getSubcribedDevices(gatewayID).then(response => {
            console.log(response.data)
            setDeviceList(response.data)
        }).catch(err => setDeviceList([]))
    }, [gatewayID])

    const openConfigModal = device => {
        GatewayService.getSubcribedDevices()
        setShow(true)
        setConfigDevice(device)
    }

    return <div className="m-3 mt-0">
        <div className="p-2 row m-0 mb-2 fst-italic bg-primary text-white">
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

        {/* {configDevice !== null && <ConfigTagModal
            show={show} onHide={() => setShow(false)}
            tagList={configDevice.tagList}
            addr={configDevice.addr}
        />} */}

        {deviceList.map(device => <Device
            key={device.ID}
            ID={device.ID}
            name={device.name}
            openConfig={() => openConfigModal(device)}
        />)}
    </div>
}

function Device({ name, ID, openConfig }) {
    return <div
        onClick={openConfig}
        className="row p-2 m-0 mb-2 bg-white border border-1 shadow-sm rounded hover"
    >
        <div className="col-3 text-primary"><u>#{ID}</u></div>
        <div className="col">{name}</div>
        <div className="col-auto">
            <Pencil className="hover me-2" size={18} />
            <Trash className="hover" size={18} />
        </div>
    </div>
}