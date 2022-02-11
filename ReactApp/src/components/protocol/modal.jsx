import { useState } from "react"
import { Modal, Form, Badge, Button } from "react-bootstrap"
import { Plus } from "react-bootstrap-icons"
import * as type from './datatypes'

export default function AddModal({ show, setShow }) {
    const [attrNum, setAttrNum] = useState(1)

    const handleAddAttr = () => {
        setAttrNum(attrNum + 1)
    }

    return <Modal show={show} onHide={() => setShow(false)} centered>
        {/* <Modal.Header closeButton>
            <h4>Add new protocol</h4>
        </Modal.Header> */}
        <Modal.Body>
            <Form>
                <Form.Group className="mb-2">
                    <Form.Label><b>Protocol name</b></Form.Label>
                    <Form.Control type="text" required  placeholder="Type a name ..." />
                </Form.Group>
                <hr />
                <div className="row">
                    <h6 className="col-9">Attribute name</h6>
                    <h6 className="col-3">Datatype</h6>
                </div>
                {duplicate(<AttributeForm />, attrNum)}
                <Badge className="hover text-secondary"
                    bg="light"
                    onClick={handleAddAttr}
                >
                    Add <Plus className="hover" size={16} />
                </Badge>
                <Button 
                    variant="primary" type="submit" 
                    className="float-end"
                >
                    Submit
                </Button>
            </Form>
        </Modal.Body>
    </Modal>
}

function AttributeForm() {
    return <div className="row mb-2">
        <Form.Group className="col-9">
            <Form.Control type="text" required placeholder="i.e column name ..." />
        </Form.Group>
        <Form.Group className="col-3">
            <Form.Select>
                <option>{type.INT}</option>
                <option>{type.REAL}</option>
                <option>{type.TEXT}</option>
                <option>{type.BLOB}</option>
            </Form.Select>
        </Form.Group>
    </div>
}

function duplicate(target, n) {
    let arr = []
    for (let i = 0; i < n; i++) {
        arr.push(target)
    }
    return arr
}