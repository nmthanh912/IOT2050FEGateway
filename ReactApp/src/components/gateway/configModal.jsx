import { useState } from "react"
import { Modal, Form, Button } from "react-bootstrap"
import GatewayService from '../../services/gateway'

export default function ConfigModal({ show, onHide }) {
    const [gatewayInfo, setGatewayInfo] = useState({
        name: '',
        description: '',
        protocol: gatewayConfigInfo[0],
        config: {}
    })

    const setName = name => setGatewayInfo({ ...gatewayInfo, name })
    const setDescription = description => setGatewayInfo({ ...gatewayInfo, description })
    const setProtocol = value => {
        let protocol = gatewayConfigInfo.find(p => p.value === value)
        setGatewayInfo({ ...gatewayInfo, protocol })
    }
    const setConfig = config => setGatewayInfo({ ...gatewayInfo, config })

    return <Modal show={show} onHide={onHide}>
        <Modal.Header className="bg-primary text-white">
            <h5 className="m-auto">Add new Gateway</h5>
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
                        {gatewayConfigInfo.map(protocol => {
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
                    GatewayService.add({
                        ...gatewayInfo,
                        protocol: gatewayInfo.protocol.value
                    }).then(response => console.log(response.data))
                }}
            >
                Submit
            </Button>
        </Modal.Body>
    </Modal>
}

const gatewayConfigInfo = [{
    value: 'MQTT_Client',
    label: 'MQTT Client',
    attrs: ['username', 'password', 'IP', 'port']
}]