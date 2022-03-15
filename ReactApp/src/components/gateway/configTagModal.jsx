import { useState, useMemo } from "react"
import { Modal, Form, Button } from "react-bootstrap"
import ReactPrismEditor from 'react-prism-editor'
import ShortUniqueId from "short-unique-id"

const uid = new ShortUniqueId({
    length: 5,
    dictionary: 'hex'
})

export default function ConfigTagModal({ show, onHide, tagList, addr }) {
    const [customMode, setCustomMode] = useState(false)
    const [code, setCode] = useState(' /* You can custom property by define new JSON here */\n')

    const list = useMemo(() => {
        return tagList.map(tag => ({ ...tag, addr: addr + '/' + tag.property }))
    }, [tagList, addr])

    return <Modal show={show} onHide={onHide} centered size="xl">
        <Modal.Header className="bg-primary">
            <h5 className="m-auto text-white">Config device's tags</h5>
        </Modal.Header>
        <Modal.Body>
            <TagTable data={list} />
            <Form.Group className="d-flex my-2 justify-content-end">
                <Form.Check
                    type="switch"
                    checked={customMode}
                    onChange={() => setCustomMode(!customMode)}
                />
                <Form.Label>Use custom mode</Form.Label>
            </Form.Group>
            {customMode &&
                <div>
                    <div className="mb-2">Address: <i className="text-primary">{addr}</i></div>
                    <ReactPrismEditor
                        language={'javascript'}
                        theme={'okaidia'}
                        code={code}
                        lineNumber={true}
                        readOnly={false}
                        clipboard={false}
                        changeCode={code => {
                            if (code !== '') setCode(code)
                        }}
                    />
                </div>}
            <div className="d-flex justify-content-end">
                <Button className="text-white fw-bold">Save</Button>
            </div>
        </Modal.Body>
    </Modal>
}

function TagTable({ data }) {
    const columns = useMemo(() => {
        return Object.keys(data[0]).map(key => key[0].toUpperCase() + key.slice(1))
    }, [data])

    return <div>
        <table className="styled-table w-100">
            <thead>
                <tr>
                    {columns.map(col => <th key={uid()} >
                        {col}
                    </th>)}
                </tr>
            </thead>
            <tbody>
                {data.map(row => <tr key={uid()}>
                    {Object.values(row).map(cell => typeof cell !== "boolean" ?
                        <td key={uid()}>
                            <span className='hover'>{cell}</span>
                        </td> : <td key={uid()}>
                            <Form.Check
                                type="switch"
                                checked={cell}
                            />
                        </td>
                    )}
                </tr>
                )}
            </tbody>
        </table>
    </div>
}