import { useState, useEffect } from "react"
import { Modal, Form, Badge, Button } from "react-bootstrap"
import { Plus, X } from "react-bootstrap-icons"
import * as type from './datatypes'
import ShortUniqueId from "short-unique-id"
import { createTable, alterTable } from "../../redux/slices/protocol"
import { useDispatch } from "react-redux"

const uid = new ShortUniqueId({
    length: 5,
    dictionary: 'hex'
})

const defaultSchemaForm = {
    sname: '',
    columns: [{
        id: uid(),
        colName: '',
        type: type.INT,
        notNull: false
    }]
}

export default function SchemaModal({ show, setShow, edit }) {
    const dispatch = useDispatch()
    const [schema, setSchema] = useState(defaultSchemaForm)

    // Set default state
    useEffect(() => {
        if(!edit) return
        const prev = JSON.parse(JSON.stringify(edit))
        // console.log(prev)
        prev.columns.forEach(col => col.id = uid())
        setSchema(prev)
    }, [edit])

    const setSchemaName = name => {
        setSchema({
            ...schema,
            sname: name
        })
    }
    const addAttr = () => {
        setSchema({
            ...schema,
            columns: [
                ...schema.columns,
                {
                    id: uid(),
                    colName: '',
                    type: type.INT,
                    notNull: false
                }
            ]
        })
    }
    const deleteAttr = id => {
        let newSchema = { ...schema }
        let idx = newSchema.columns.findIndex(col => col.id === id)
        newSchema.columns.splice(idx, 1)
        setSchema(newSchema)
    }
    const setAttr = (id, attr) => {
        let newSchema = { ...schema }
        let idx = newSchema.columns.findIndex(col => col.id === id)
        newSchema.columns[idx].colName = attr.colName
        newSchema.columns[idx].type = attr.type
        newSchema.columns[idx].notNull = attr.notNull
        setSchema(newSchema)
    }

    const checkDuplicateAttrName = () => {
        return schema.columns.length === new Set(schema.columns).size
    }

    const createSchema = () => {
        if (!checkDuplicateAttrName()) {
            alert('Duplicate attribute name')
            return
        }
        const newSchema = { ...schema }
        newSchema.columns.forEach(col => delete col.id)
        dispatch(createTable(newSchema))
        setShow(false)
        setSchema(edit ? edit : defaultSchemaForm)
    }

    const editSchema = () => {
        if (!checkDuplicateAttrName()) {
            alert('Duplicate attribute name')
            return
        }
        const newSchema = { ...schema }
        newSchema.columns.forEach(col => delete col.id)
        dispatch(alterTable({
            prev: edit,
            next: newSchema
        }))
        setShow(false)
        setSchema(edit ? edit : defaultSchemaForm)
    }

    return <Modal show={show} onHide={() => setShow(false)} size='md'>
        <Modal.Header className="bg-dark text-light">
            <h5 className="m-auto">Add a new protocol</h5>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group className="mb-1">
                    <Form.Label><b>Protocol name</b></Form.Label>
                    <Form.Control type="text" required placeholder="Type a name ..."
                        value={schema.sname}
                        onChange={e => setSchemaName(e.target.value)}
                        size='sm'
                    />
                </Form.Group>
                <hr />
                <div className="row">
                    <h6 className="col-8">Attribute</h6>
                    <h6 className="col-4">Type</h6>
                </div>

                {schema.columns.map(col =>
                    <AttributeForm
                        key={col.id}
                        col={col}
                        deleteAttr={deleteAttr}
                        setAttr={setAttr}

                    />
                )}
                <Form.Text muted>
                    Click the checkbox if you want the attribute to be not NULL.
                </Form.Text>
                <br />
                <div className="d-flex align-items-center justify-content-between mt-2">
                    <Badge className="hover text-dark"
                        bg="light"
                        onClick={addAttr}
                    >
                        Add <Plus className="hover" size={16} />
                    </Badge>
                    <Button
                        variant="primary"
                        className="float-end"
                        size="sm"
                        onClick={!edit ? createSchema : editSchema}
                    >
                        Submit
                    </Button>
                </div>
            </Form>
        </Modal.Body>
    </Modal>
}

function AttributeForm({ col, deleteAttr, setAttr }) {
    const setName = name => {
        setAttr(col.id, {
            colName: name,
            type: col.type,
            notNull: col.notNull
        })
    }
    const setType = type => {
        setAttr(col.id, {
            colName: col.colName,
            type: type,
            notNull: col.notNull
        })
    }
    const setNotNull = notNull => {
        setAttr(col.id, {
            colName: col.colName,
            type: col.type,
            notNull: notNull
        })
    }

    return <div className="row align-items-center">
        <Form.Group className="col-8">
            <Form.Control
                type="text"
                required
                size="sm"
                placeholder="i.e column name ..."
                value={col.colName}
                onChange={e => setName(e.target.value)}
            />
        </Form.Group>
        <Form.Group className="d-flex col-4 align-items-center">
            <Form.Select size="sm" onChange={e => setType(e.target.value)}>
                <option>{type.INT}</option>
                <option>{type.REAL}</option>
                <option>{type.TEXT}</option>
                <option>{type.BLOB}</option>
            </Form.Select>
            <Form.Check className="ms-2" checked={col.notNull} onChange={e => setNotNull(e.target.checked)} />
            <X className="hover ms-1" size={40} onClick={() => deleteAttr(col.id)} />
        </Form.Group>
    </div>
}