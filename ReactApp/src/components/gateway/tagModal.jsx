import { useState, useMemo, useEffect } from "react"
import { Modal, Form, Button } from "react-bootstrap"
import ReactPrismEditor from 'react-prism-editor'
import ShortUniqueId from "short-unique-id"
import removeAccents from "../../utils/removeAccents"
import GatewayService from "../../services/configserver/gateway"

import { toast } from "react-toastify"
import ReactPaginate from "react-paginate"
import { CaretLeft, CaretRight } from "react-bootstrap-icons"

const uid = new ShortUniqueId({
  length: 5,
  dictionary: 'hex'
})

const commentStr = `// You can custom property by define new JSON Object.\n// Your code must be an JSON object.\n// Value can be any expressions, but you must use provided property.\n`

export default function TagModal({
  show, onHide, configCode,
  tagList, prefixTopic,
  gatewayID, deviceID,
  toggleCustom
}) {
  const [subsAll, setSubsAll] = useState(false)
  const [customMode, setCustomMode] = useState(toggleCustom === 1)
  const [code, setCode] = useState(commentStr)
  const [list, setList] = useState([])

  const notifySuccess = msg => toast.success(msg, {
    progressClassName: 'Toastify__progress-bar--success',
    toastId: 'gatewayTagModalSucess'
  })
  const notifyFail = msg => toast.error(msg, {
    progressClassName: 'Toastify__progress-bar--error',
    toastId: 'gatewayTagModalFail'
  })

  useEffect(() => {
    const data = tagList.map(tag => ({
      ...tag,
      Topic: prefixTopic + '/' + removeAccents(tag.name),
      property: removeAccents(tag.name)
    }))
    setList(data)
    setCustomMode(toggleCustom === 1)
    if (configCode) setCode(commentStr + configCode)
  }, [tagList, prefixTopic, configCode, toggleCustom])

  useEffect(() => {
    if (!configCode) {
      const initJson = {}
      const subscribeList = list.filter(val => val.subscribe === true)
      subscribeList.forEach(val => initJson['custom_' + val.property] = `{...${val.property}}`)
      setCode(commentStr + JSON.stringify(initJson, null, "\t").replaceAll('"', ''))
    }
  }, [list, configCode])

  const toggleSubscribeAll = () => {
    const newList = [...list]
    newList.forEach(tag => {
      tag.subscribe = !subsAll
    })
    setList(newList)
  }

  useEffect(() => {
    let bool = list.every(tag => tag.subscribe === true)
    setSubsAll(bool)
  }, [list])

  const toggleSubscribe = tagName => {
    const newList = [...list]
    let idx = newList.findIndex(tag => tag.name === tagName)
    newList[idx].subscribe = !newList[idx].subscribe
    setList(newList)
  }

  const updateSubscribes = () => {
    const tagList = list.map(val => ({ subscribe: val.subscribe, name: val.name }))
    let data = {
      code: code,
      tagList: tagList.filter(val => val.subscribe === true).map(val => ({ name: val.name })),
      toggle: customMode
    }
    GatewayService.updateSubcribedDeviceConfig(gatewayID, deviceID, data).then(response => {
      // console.log(response.data);
      notifySuccess('Update config successfully !')
    }).catch(err => notifyFail(err.message))
  }

  const [currentItems, setCurrentItems] = useState(list);
  const [pageCount, setPageCount] = useState(0);
  const [beginIdx, setBeginIdx] = useState(0);
  const itemsPerPage = useMemo(() => 10, [])


  useEffect(() => {
    const endIdx = beginIdx + itemsPerPage;
    setCurrentItems(list.slice(beginIdx, endIdx));
    setPageCount(Math.ceil(list.length / itemsPerPage));
  }, [beginIdx, itemsPerPage, list]);

  const pageClick = event => {
    const newBeginIdx = (event.selected * itemsPerPage) % list.length;
    setBeginIdx(newBeginIdx);
  };

  return <div>
    <Modal show={show} onHide={onHide} centered size="xl">
      <Modal.Header className="bg-primary" >
        <h5 className="m-auto text-white">Config device's tags</h5>
      </Modal.Header>
      <Modal.Body>
        {currentItems.length !== 0 && <div style={{ boxSizing: 'content-box' }}>
          <TagTable
            data={currentItems} toggleSubscribe={toggleSubscribe}
            toggleSubscribeAll={toggleSubscribeAll}
            subsAll={subsAll}
            disabled={customMode}
          />
        </div>}

        <div className="d-flex align-items-center justify-content-between my-2">
          <ReactPaginate
            breakLabel="..."
            nextLabel={<CaretRight />}
            previousLabel={<CaretLeft />}
            onPageChange={pageClick}
            pageRangeDisplayed={2}
            pageCount={pageCount}
            renderOnZeroPageCount={null}
            breakClassName={'page-item'}
            breakLinkClassName={'page-link'}
            containerClassName={'pagination'}
            pageClassName={'page-item'}
            pageLinkClassName={'page-link'}
            previousClassName={'page-item'}
            previousLinkClassName={'page-link'}
            nextClassName={'page-item'}
            nextLinkClassName={'page-link'}
            activeClassName={'active'}
          />

          <Form.Group className="d-flex mt-2">
            <Form.Check
              type="switch"
              checked={customMode}
              onChange={() => setCustomMode(!customMode)}
            />
            <Form.Label>Use custom mode</Form.Label>
          </Form.Group>
        </div>

        {/* Custom code */}
        {customMode && <div>
          <div className="d-flex justify-content-between mb-2">
            <div>Topic: <i className="text-primary">{prefixTopic}</i></div>
            <div className="text-danger">Please turn off Unikey before coding !</div>
          </div>

          <ReactPrismEditor
            language={'javascript'}
            theme={'okaidia'}
            code={code}
            lineNumber={true}
            readOnly={false}
            clipboard={false}
            changeCode={code => {
              if (code !== '') setCode(code)
              console.log(code)
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

function TagTable({ data, toggleSubscribe, toggleSubscribeAll, subsAll, disabled }) {
  const columns = useMemo(() => {
    return Object.keys(data[0]).map(key => key[0].toUpperCase() + key.slice(1))
  }, [data])

  return <table className="styled-table w-100">
    <thead>
      <tr>
        {
          columns.map((col, index) => index !== 0 ? <th key={uid()} >
            {col}
          </th> :
            <th className="d-flex align-items-center" key={uid()}>
              <Form.Check
                type="checkbox"
                checked={subsAll}
                onChange={toggleSubscribeAll}
                className='me-2'
                id="suball"
                disabled={disabled}
              />
              <label htmlFor="suball">Subscribe</label>
            </th>)
        }
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
              onChange={() => toggleSubscribe(row.name)}
              disabled={disabled}
            />
          </td>
        )}
      </tr>
      )}
    </tbody>
  </table>
}
