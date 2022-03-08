import { useState, useMemo } from "react"
import { FormCheck, Modal } from "react-bootstrap"
import { Pencil, Trash } from "react-bootstrap-icons"
import { useSelector } from 'react-redux'
import TagList from '../device/paginateTagList'
import ShortUniqueId from "short-unique-id"

const uid = new ShortUniqueId({
    length: 5,
    dictionary: 'hex'
})

export default function MappingList({ list }) {
    const deviceList = useSelector(state => {
        return state.device.filter(val => list.includes(val.ID))
    })
    const [show, setShow] = useState(false)
    const [configDevice, setConfigDevice] = useState({
        ID: '',
        protocol: ''
    })

    const openConfigModal = device => {
        setShow(true)
        setConfigDevice(device)
    }

    return <div className="m-3 mt-0">
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
        <ConfigTagModal
            show={show} onHide={() => setShow(false)}
            device={configDevice}
        />
        {deviceList.map(device => <Device
            key={device.ID}
            ID={device.ID}
            name={device.name}
            openConfig={() => openConfigModal(device)}
        />)}
    </div>
}

function ConfigTagModal({ show, onHide, device }) {
    // console.log(device)
    return <Modal show={show} onHide={onHide} centered size="lg">
        <Modal.Header className="bg-primary">
            <h5 className="m-auto text-white">Config device's tags</h5>
        </Modal.Header>
        <Modal.Body>
            <TagList deviceID={device.ID} protocol={device.protocol} Table={TagTable} />
        </Modal.Body>
    </Modal>
}

function TagTable({ data }) {
    const columns = useMemo(() => {
        return Object.keys(data[0]).map(key => key[0].toUpperCase() + key.slice(1))
    }, [data])
    const subs = useMemo(() => {
        return data.map(sub => ({ register: false, ...sub }))
    }, [data])
    const [subcribers, setSubcribers] = useState(subs)
    const [registerAll, setRegisterAll] = useState(false)

    return <div>
        <table className="styled-table w-100" >
            <thead>
                <tr>
                    <th>
                        {/* <FormCheck 
                            value={registerAll} 
                            onClick={() => setRegisterAll(!registerAll)}
                        /> */}
                    </th>
                    {columns.map(col => <th key={uid()} >
                        {col}
                    </th>)}
                </tr>
            </thead>
            <tbody>
                {subcribers.map(row => {
                    return <tr key={uid()}>
                        {Object.values(row).map(cell => <td key={uid()}><span className='hover'>{cell}</span></td>)}
                    </tr>
                })}
            </tbody>
        </table>
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