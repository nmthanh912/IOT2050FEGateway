import { Modal, Form, Button } from "react-bootstrap"
import CreatableSelect from 'react-select/creatable'
import { useState, useEffect } from 'react'
import { useDispatch } from "react-redux";
import { addClient } from "../../redux/slices/mqtt";

const defaultForm = {
    uname: 'usern',
    pwd: '123456',
    IP: '192.100.10.1',
    port: '3000',
    published: [],
    subcribed: [{
        value: 'http://192.168.10.1',
        label: 'http://192.168.10.1',
        isFixed: true
    }, {
        value: 'http://192.168.20.2',
        label: 'http://192.168.20.2',
        isFixed: true
    }, {
        value: 'http://192.168.30.3',
        label: 'http://192.168.30.3',
        isFixed: true
    }]
}

export default function MqttModal({ show, setShow, edit }) {
    const dispatch = useDispatch()
    const [clientData, setClientData] = useState(defaultForm)

    useEffect(() => {
        if(!edit) return
        setClientData(edit)
    }, [edit])

    const setUsername = name => setClientData({ ...clientData, uname: name })
    const setPassword = pwd => setClientData({ ...clientData, pwd })
    const setIP = IP => setClientData({ ...clientData, IP })
    const setPort = port => setClientData({ ...clientData, port })
    const setPublished = arr => setClientData({ ...clientData, published: arr })
    const setSubcribed = arr => setClientData({ ...clientData, subcribed: arr })

    const addNewClient = () => dispatch(addClient(clientData))
    const editExistClient = () => {}
 
    return <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header className="bg-dark text-white">
            <h5 className="m-auto">Create new client</h5>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group className="mb-2">
                    <Form.Label>Username:</Form.Label>
                    <Form.Control
                        type="text" required
                        placeholder="Username"
                        value={clientData.uname}
                        onChange={e => setUsername(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-2">
                    <Form.Label>Password:</Form.Label>
                    <Form.Control
                        type="text" required
                        placeholder="*****************"
                        value={clientData.pwd}
                        onChange={e => setPassword(e.target.value)}
                    />
                </Form.Group>

                <div className="row mb-2">
                    <Form.Group className="col-6">
                        <Form.Label>IP:</Form.Label>
                        <Form.Control
                            type="text" required
                            placeholder="xxx.xxx.xxx.xxx"
                            value={clientData.IP}
                            onChange={e => setIP(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="col-6">
                        <Form.Label>Port:</Form.Label>
                        <Form.Control
                            type="number" required
                            placeholder="Port number"
                            value={clientData.port}
                            onChange={e => setPort(e.target.value)}
                        />
                    </Form.Group>
                </div>
                <Form.Group className="mb-2">
                    <Form.Label>Published address:</Form.Label>
                    <CreatableSelect
                        isMulti
                        onChange={newAddr => setPublished([...clientData.published, ...newAddr])}
                        options={clientData.published}
                    />
                </Form.Group>
                <Form.Group className="mb-2">
                    <Form.Label>Subcribed address:</Form.Label>
                    <CreatableSelect
                        isMulti
                        onChange={newAddr => {setSubcribed([...clientData.subcribed, ...newAddr])
                        console.log(newAddr)}}
                        options={clientData.subcribed}
                    />
                </Form.Group>
                <Button className="float-end" onClick={addNewClient}>
                    Submit
                </Button>
            </Form>
        </Modal.Body>
    </Modal>
}