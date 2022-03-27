import { useState, useEffect, useMemo } from "react"
import { Trash, PlusCircle } from "react-bootstrap-icons"
import { Button, Form, InputGroup, Modal } from "react-bootstrap"
import TagModal from "./tagModal"
import GatewayService from '../../services/gateway'
import removeAccents from "../../utils/removeAccents"
import { useSelector } from "react-redux"

export default function MappingList({ gatewayID }) {
    const allDeviceData = useSelector(state => state.device)
    const [showTagModal, setShowTagModal] = useState(false)
    const [configuringDevice, setConfiguringDevice] = useState(null)
    const [deviceList, setDeviceList] = useState([])
    const [showSubscribeModal, setShowSubscribeModal] = useState(false)

    const [selectSubsDevice, setSelectSubsDevice] = useState('')

    const restDevices = useMemo(() => {

        let allDeviceBasic = allDeviceData.map(val => ({
            ID: val.ID,
            name: val.name,
            protocol: val.protocol
        }))
        let rest = allDeviceBasic.filter(val => {
            return !deviceList.some(device => device.ID === val.ID)
        })
        return rest
    }, [allDeviceData, deviceList])

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
                    toggle: response.data.toggle
                })
            })
            .catch(err => console.log(err))
        setShowTagModal(true)
    }

    const addSubscribeDevice = () => {
        let deviceID = selectSubsDevice
        GatewayService.addSubscribeDevice(gatewayID, deviceID).then(response => {
            setSelectSubsDevice('')
            console.log(response.data)
            let device = allDeviceData.find(val => val.ID === deviceID)
            setDeviceList([...deviceList, { ID: device.ID, name: device.name, protocol: device.protocol }])
        })
    }

    const removeSubscribedDevice = deviceID => {
        GatewayService.removeSubscribedDevice(gatewayID, deviceID).then(response => {
            console.log(response.data)
            let newDeviceList = [...deviceList]
            let idx = newDeviceList.findIndex(val => val.ID === deviceID)
            newDeviceList.splice(idx, 1)
            setDeviceList(newDeviceList)
        }).catch(err => console.log(err))
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
                    removeSubscribe={() => removeSubscribedDevice(device.ID)}
                />)}
            </tbody>
        </table>

        {configuringDevice !== null && configuringDevice.tagList &&
            <TagModal
                show={showTagModal} onHide={() => {
                    setShowTagModal(false)
                    setConfiguringDevice(null)
                }}
                tagList={configuringDevice.tagList}
                deviceID={configuringDevice.ID}
                gatewayID={gatewayID}
                prefixTopic={'/iot2050fe/' + removeAccents(configuringDevice.name)}
                configCode={configuringDevice.code}
                toggle={configuringDevice.toggle}
            />
        }

        <div className="d-flex justify-content-end m-2">
            <Button className="text-white d-flex align-items-center" size="sm"
                onClick={() => setShowSubscribeModal(true)}
                disabled={restDevices.length === 0}
            >
                Subscribe
                <PlusCircle size={18} className='ms-1' />
            </Button>
        </div>

        <Modal show={showSubscribeModal} onHide={() => setShowSubscribeModal(false)} centered>
            <Modal.Header className="bg-primary text-white">
                <h5 className="m-auto">Subscribe a device</h5>
            </Modal.Header>
            <Modal.Body>
                <InputGroup>
                    <Form.Select value={selectSubsDevice} onChange={e => setSelectSubsDevice(e.target.value)}>
                        <option value={''} disabled>---- Select a device -------</option>
                        {restDevices.map(val => <option value={val.ID} key={val.ID}>
                            {val.name}
                        </option>)}
                    </Form.Select>
                    <Button variant="primary" className="text-white" disabled={selectSubsDevice === ''}
                        onClick={addSubscribeDevice}
                    >
                        Add
                    </Button>
                </InputGroup>
            </Modal.Body>
        </Modal>
    </div>
}

function Device({ name, ID, openConfig, removeSubscribe }) {
    return <tr
        onClick={openConfig}
        className='hover'
    >
        <td className="text-primary"><u>#{ID}</u></td>
        <td>{name}</td>
        <td className="text-end">
            <Trash className="hover" size={18} onClick={e => {
                e.stopPropagation()
                removeSubscribe()
            }}/>
        </td>
    </tr>
}