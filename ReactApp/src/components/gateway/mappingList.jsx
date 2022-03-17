import { useState, useEffect } from "react"
import { Trash } from "react-bootstrap-icons"
import TagModal from "./tagModal"
import GatewayService from '../../services/gateway'
import removeAccents from "../../utils/removeAccents"

export default function MappingList({ gatewayID }) {
    const [show, setShow] = useState(false)
    const [configuringDevice, setConfiguringDevice] = useState(null)
    const [deviceList, setDeviceList] = useState([])

    useEffect(() => {
        GatewayService.getSubcribedDevices(gatewayID).then(response => {
            setDeviceList(response.data)
        }).catch(err => setDeviceList([]))
    }, [gatewayID])

    const openTagModal = device => {
        GatewayService.getSubcribedDeviceConfig(gatewayID, device.ID, device.protocol)
            .then(response => {
                console.log(response.data)
                setConfiguringDevice({
                    ...device, 
                    tagList: response.data.tagList,
                    code: response.data.code,
                })
            })
            .catch(err => console.log(err))
        setShow(true)
    }

    return <div className="mt-0">
        <table className="styled-table w-100" >
            <thead>
                <tr>
                    <th>Device ID</th>
                    <th>Device Name</th>
                    <th className="text-end">Action</th>
                </tr>
            </thead>
            <tbody>
                {deviceList.map(device => <Device
                    key={device.ID}
                    ID={device.ID}
                    name={device.name}
                    openConfig={() => openTagModal(device)}
                />)}
            </tbody>
        </table>

        {configuringDevice !== null && configuringDevice.tagList &&
            <TagModal
                show={show} onHide={() => {
                    setShow(false)
                    setConfiguringDevice(null)
                }}
                tagList={configuringDevice.tagList}
                deviceID={configuringDevice.ID}
                gatewayID={gatewayID}
                prefixTopic={'/iot2050fe/' + removeAccents(configuringDevice.name)}
                configCode={configuringDevice.code}
            />
        }
    </div>
}

function Device({ name, ID, openConfig }) {
    return <tr
        onClick={openConfig}
        className='hover'
    >
        <td className="text-primary"><u>#{ID}</u></td>
        <td>{name}</td>
        <td className="text-end">
            <Trash className="hover" size={18} />
        </td>
    </tr>
}