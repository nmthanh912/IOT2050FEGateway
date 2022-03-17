import { useEffect, useState } from "react"
import { Modal, Form, Button } from "react-bootstrap"

export default function ConfigModal({ show, onHide, onSubmit, editTarget }) {
    const [gatewayInfo, setGatewayInfo] = useState(initState)

    useEffect(() => {
        setGatewayInfo(editTarget !== null ? { ...editTarget, protocol: gatewayProtocol[0] } : initState)
    }, [editTarget])

    const setName = name => setGatewayInfo({ ...gatewayInfo, name })
    const setDescription = description => setGatewayInfo({ ...gatewayInfo, description })
    const setProtocol = value => {
        let protocol = gatewayProtocol.find(p => p.value === value)
        setGatewayInfo({ ...gatewayInfo, protocol })
    }
    const setConfig = config => setGatewayInfo({ ...gatewayInfo, config })

    return <Modal show={show} onHide={onHide}>
        <Modal.Header className="bg-primary text-white">
            {editTarget ?
                <h5 className="m-auto">Edit gateway {editTarget.ID}</h5>
                : <h5 className="m-auto">Add new Gateway</h5>
            }
        </Modal.Header>
        <Modal.Body>
            <div className="row mb-2">
                <Form.Group className='col-6'>
                    <Form.Label>Gateway name:</Form.Label>
                    <Form.Control
                        type="text" value={gatewayInfo.name} size="sm"
                        placeholder="Device name ..."
                        onChange={e => setName(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className='col-6'>
                    <Form.Label>Protocol:</Form.Label>
                    <Form.Select
                        size="sm"
                        value={gatewayInfo.protocol.value}
                        onChange={e => setProtocol(e.target.value)}
                        placeholder='Select protocol'
                        required
                    >
                        {gatewayProtocol.map(protocol => {
                            return <option value={protocol.value} key={protocol.value}>
                                {protocol.label}
                            </option>
                        })}
                    </Form.Select>
                </Form.Group>
            </div>

            <Form.Group>
                <Form.Label>Description:</Form.Label>
                <Form.Control
                    type="text" as="textarea" size="sm"
                    placeholder="Description ..."
                    value={gatewayInfo.description}
                    onChange={e => setDescription(e.target.value)}
                />
            </Form.Group>

            <hr />

            <h5><b>Configration Info</b></h5>
            {gatewayInfo.protocol.attrs.map(attr => {
                const label = attr.charAt(0).toUpperCase() + attr.slice(1)
                return <Form.Group key={attr} className='mb-2'>
                    <Form.Label>{label}:</Form.Label>
                    <Form.Control
                        type="text" size="sm"
                        placeholder={label + ' ...'}
                        required
                        value={gatewayInfo.config[attr] ? gatewayInfo.config[attr] : ''}
                        onChange={e => setConfig({ ...gatewayInfo.config, [attr]: e.target.value })}
                    />
                </Form.Group>
            })}

            <Button size="sm" className="float-end text-white"
                onClick={() => {
                    onSubmit({
                        ...gatewayInfo,
                        protocol: gatewayInfo.protocol.value
                    })
                    setGatewayInfo(initState)
                    onHide()
                }}
            >
                Submit
            </Button>
        </Modal.Body>
    </Modal>
}

const gatewayProtocol = [{
    value: 'MQTT_Client',
    label: 'MQTT Client',
    attrs: ['username', 'password', 'IP', 'port']
}]

const initState = {
    name: '',
    description: '',
    protocol: gatewayProtocol[0],
    config: {}
}