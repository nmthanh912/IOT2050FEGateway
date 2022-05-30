import { useEffect, useState } from "react"
import { Modal, Form, Button } from "react-bootstrap"
import gatewayProtocol from "../../format/gatewayProtocolConfig"

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
            <Form onSubmit={e => {
                e.preventDefault()
                onSubmit({
                    ...gatewayInfo,
                    protocol: gatewayInfo.protocol.value
                })
                setGatewayInfo(initState)
                console.log(gatewayInfo)
                onHide()
            }}>
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
                    const label = attr.name.charAt(0).toUpperCase() + attr.name.slice(1)
                    return attr.type !== "select" ?
                        <Form.Group key={attr.name} className='mb-2'>
                            <Form.Label>{label}:</Form.Label>
                            <Form.Control
                                type={attr.type} size="sm"
                                placeholder={label + ' ...'}
                                required
                                value={gatewayInfo.config[attr.name] ? gatewayInfo.config[attr.name] : ''}
                                onChange={e => setConfig({
                                    ...gatewayInfo.config,
                                    [attr.name]: attr.type === "number" ? parseInt(e.target.value) : e.target.value
                                })}
                            />
                        </Form.Group>
                        : <Form.Group key={attr.name} className='mb-2'>
                            <Form.Label>{label}:</Form.Label>
                            <Form.Select
                                size="sm"
                                placeholder={label + ' ...'}
                                required
                                value={gatewayInfo.config[attr.name] ? gatewayInfo.config[attr.name] : 0}
                                onChange={e => setConfig({ ...gatewayInfo.config, [attr.name]: e.target.value })}
                            >
                                <option value={''}>--- Pick a QoS ---</option>
                                {attr.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </Form.Select>
                        </Form.Group>
                })}

                <Button className="float-end text-white" type="submit">
                    Submit
                </Button>
            </Form>
        </Modal.Body>
    </Modal>
}


const initState = {
    name: '',
    description: '',
    protocol: gatewayProtocol[0],
    config: {
        QoS: 0
    }
}