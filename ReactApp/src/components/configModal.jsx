import { useState } from "react"
import { Modal, Form, Button } from "react-bootstrap"

export default function ConfigModal({ show, onHide, formats }) {
    // const [useTemplate, setUseTemplate] = useState(false)

    const [deviceInfo, setDeviceInfo] = useState({
        name: '',
        description: '',
        protocol: formats[0],
        config: {}
    })

    const setName = name => setDeviceInfo({ ...deviceInfo, name })
    const setDescription = description => setDeviceInfo({ ...deviceInfo, description })
    const setProtocol = value => {
        let protocol = formats.find(p => p.value === value)
        setDeviceInfo({ ...deviceInfo, protocol })
        // setTimeout(() => console.log(deviceInfo), 2000)
    }

    return <Modal show={show} onHide={onHide}>
        <Modal.Header className="bg-dark text-white">
            <h5 className="m-auto">Add new device</h5>
        </Modal.Header>
        <Modal.Body>
            <Form>
                {/* <span className="me-2 fw-bold">Use Template:</span>
                <Form.Group className="d-flex align-items-center mt-1">
                    
                    <Form.Select
                        disabled={!useTemplate} size='sm'
                    >
                        <option value={'template1'}>Template 1</option>
                        <option value={'template2'}>Template 2</option>
                        <option value={'template3'}>Template 3</option>
                        <option value={'template4'}>Template 4</option>
                    </Form.Select>
                    <Form.Switch
                        value={useTemplate}
                        onChange={() => setUseTemplate(!useTemplate)}
                        className='ms-2 '
                    />
                </Form.Group> */}
                <hr />
                <div className="row mb-2">
                    <Form.Group className='col-6'>
                        <Form.Label>Device name:</Form.Label>
                        <Form.Control
                            type="text" value={deviceInfo.name} size="sm"
                            placeholder="Device name ..."
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className='col-6'>
                        <Form.Label>Protocol:</Form.Label>
                        <Form.Select
                            size="sm"
                            value={deviceInfo.protocol.value}
                            onChange={e => setProtocol(e.target.value)}
                            placeholder='Select protocol'
                            required
                        >
                            {/* <option value={''}></option> */}
                            {formats.map(protocol => {
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
                {deviceInfo.protocol.attrs.map(attr => {
                    const attrName = attr.charAt(0).toUpperCase() + attr.slice(1)
                    return <Form.Group key={attr} className='mb-2'>
                        <Form.Label>{attrName}:</Form.Label>
                        <Form.Control
                            type="text" size="sm"
                            placeholder={attrName + ' ...'}
                            required
                        />
                    </Form.Group>
                })}
                <Button type="submit" size="sm" className="float-end">Submit</Button>
            </Form>
        </Modal.Body>
    </Modal>
}