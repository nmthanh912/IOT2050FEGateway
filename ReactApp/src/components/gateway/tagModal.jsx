import { useState, useMemo, useEffect } from "react"
import { Modal, Form, Button } from "react-bootstrap"
import ReactPrismEditor from 'react-prism-editor'
import ShortUniqueId from "short-unique-id"
import removeAccents from "../../utils/removeAccents"
import GatewayService from "../../services/gateway"

import { toast, ToastContainer } from "react-toastify"
import { SuccessMessage, FailMessage } from "../toastMsg"

const uid = new ShortUniqueId({
  length: 5,
  dictionary: 'hex'
})

const commentStr = `// You can custom property by define new JSON Object.\n// Your code must be an JSON object.\n// Keys and values must be all strings.\n`

export default function TagModal({
  show, onHide, configCode,
  tagList, prefixTopic,
  gatewayID, deviceID
}) {
  const [customMode, setCustomMode] = useState(false)
  const [code, setCode] = useState(commentStr)
  const [list, setList] = useState([])

  const notifySuccess = msg => toast(<SuccessMessage msg={msg} />, {
    progressClassName: 'Toastify__progress-bar--success'
  })
  const notifyFail = msg => toast(<FailMessage msg={msg}/>, {
    progressClassName: 'Toastify__progress-bar--error'
  })

  useEffect(() => {
    setList(tagList.map(tag => ({
      ...tag,
      Topic: prefixTopic + '/' + removeAccents(tag.name),
      property: removeAccents(tag.name)
    })))
    if (configCode) {
      setCode(configCode)
      setCustomMode(true)
    }
  }, [tagList, prefixTopic, configCode])

  const toggleSubcribe = tagName => {
    const newList = [...list]
    let idx = newList.findIndex(tag => tag.name === tagName)
    newList[idx].subscribe = !newList[idx].subscribe
    setList(newList)
  }

  const updateSubscribes = () => {
    const tagList = list.map(val => ({ subscribe: val.subscribe, name: val.name }))
    let data = {
      code: customMode ? code : null,
      tagList: tagList.filter(val => val.subscribe === true).map(val => ({ name: val.name }))
    }
    GatewayService.updateSubcribedDeviceConfig(gatewayID, deviceID, data).then(response => {
      // console.log(response.data);
      notifySuccess('Update config successfully !')
    }).catch(err => notifyFail(err.message))
  }

  return <div>
    <ToastContainer
      pauseOnHover={false}
      position="top-right"
      autoClose={1500}
    />
    <Modal show={show} onHide={onHide} centered size="xl">
      <Modal.Header className="bg-primary" >
        <h5 className="m-auto text-white">Config device's tags</h5>
      </Modal.Header>
      <Modal.Body>
        {list.length !== 0 && <TagTable data={list} toggleSubcribe={toggleSubcribe} />}

        <Form.Group className="d-flex my-2 justify-content-end">
          <Form.Check
            type="switch"
            checked={customMode}
            onChange={() => setCustomMode(!customMode)}
          />
          <Form.Label>Use custom mode</Form.Label>
        </Form.Group>

        {/* Custom code */}
        {customMode && <div>
          <div className="mb-2">Topic: <i className="text-primary">{prefixTopic}</i></div>
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
          <Button className="text-white fw-bold" onClick={() => {
            updateSubscribes()
            onHide()
          }}>
            Save
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  </div>

}

function TagTable({ data, toggleSubcribe }) {
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
          {Object.values(row).map(cell => typeof cell !== 'boolean' ?
            <td key={uid()}>
              <span className='hover'>{cell}</span>
            </td> : <td key={uid()}>
              <Form.Check
                type="switch"
                checked={cell}
                onChange={() => toggleSubcribe(row.name)}
              />
            </td>
          )}
        </tr>
        )}
      </tbody>
    </table>
  </div>
}
