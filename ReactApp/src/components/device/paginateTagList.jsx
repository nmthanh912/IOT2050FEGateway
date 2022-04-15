import ReactPaginate from "react-paginate"
import { FormGroup, FormSelect, FormText, Form, Badge } from "react-bootstrap"
import { useState, useEffect, useRef, useMemo } from "react";
import { CaretLeft, CaretRight, Trash, Save } from "react-bootstrap-icons";
import ShortUniqueId from "short-unique-id";
import { useDispatch, useSelector } from "react-redux";
import { fetchTags, editTagCell, removeTag, addNewTag } from "../../redux/slices/device";
import DeviceService from '../../services/configserver/device'

const uid = new ShortUniqueId({
  length: 5,
  dictionary: 'hex'
})

export default function PaginateTagList({ deviceID, protocol, Table, readOnly }) {
  const dispatch = useDispatch()
  const tagList = useSelector(state => {
    const device = state.device.find(val => val.ID === deviceID)
    return device.tagList
  })

  const [currentItems, setCurrentItems] = useState(tagList);
  const [pageCount, setPageCount] = useState(0);
  const [beginIdx, setBeginIdx] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10)


  useEffect(() => {
    const endIdx = beginIdx + itemsPerPage;
    setCurrentItems(tagList.slice(beginIdx, endIdx));
    setPageCount(Math.ceil(tagList.length / itemsPerPage));
  }, [beginIdx, itemsPerPage, tagList]);

  const pageClick = event => {
    const newBeginIdx = (event.selected * itemsPerPage) % tagList.length;
    setBeginIdx(newBeginIdx);
  };

  useEffect(() => {
    if (tagList.length === 0) {
      console.log("FETCH FROM DB")
      dispatch(fetchTags({ deviceID, protocol }))
    } else console.log("LOAD FROM STORE")
  }, [])

  const resetState = (newItemsPerPage) => {
    // Set page to 0
    setCurrentItems(tagList.slice(0, newItemsPerPage))
    setPageCount(0)
    setItemsPerPage(newItemsPerPage)
  }

  return (
    <div>
      {currentItems.length !== 0 && <Table
        data={currentItems}
        deviceID={deviceID}
        protocol={protocol}
        readOnly={readOnly}
      />}
      <div className="d-flex align-items-center justify-content-end m-3">
        <FormText>Items/Page:</FormText>
        <FormGroup className="mx-2">
          <FormSelect value={itemsPerPage} onChange={e => resetState(e.target.value)}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </FormSelect>
        </FormGroup>
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
          containerClassName={'pagination '}
          pageClassName={'page-item sm'}
          pageLinkClassName={'page-link'}
          previousClassName={'page-item'}
          previousLinkClassName={'page-link'}
          nextClassName={'page-item'}
          nextLinkClassName={'page-link'}
          activeClassName={'active'}
        />
      </div>
    </div>
  );
}

export function TagTable({ data, deviceID, protocol, readOnly }) {
  const columns = useMemo(() => {
    const keys = Object.keys(data[0]).map(key => key[0].toUpperCase() + key.slice(1))
    keys.push('Action')
    return keys
  }, [data])

  const dispatch = useDispatch()
  const rawColumns = useMemo(() => {
    return Object.keys(data[0])
  }, [data])

  const deleteTag = tagName => {
    DeviceService.deleteTag(deviceID, tagName).then(response => {
      console.log(response.data)
      dispatch(removeTag({ deviceID, tagName }))
    }).catch(err => console.log(err))
  }

  const [newTagAttrs, setNewTagAttrs] = useState({})

  useEffect(() => {
    const obj = {}
    rawColumns.forEach(col => obj[col] = '')
    setNewTagAttrs(obj)
  }, [rawColumns])

  const addTag = () => {
    for (let i = 0; i < rawColumns.length; ++i) {
      let col = rawColumns[i]
      console.log(col)
      if (newTagAttrs[col] === '') {
        let form = document.getElementById(deviceID + col)
        form.reportValidity()
        return
      }
    }
    DeviceService.addTag(deviceID, protocol, newTagAttrs).then(response => {
      console.log(response.data)
      const obj = {}
      rawColumns.forEach(col => obj[col] = '')
      dispatch(addNewTag({ deviceID, tag: newTagAttrs }))
      setNewTagAttrs(obj)
    })
  }

  return <div>
    <table className="styled-table w-100" >
      <thead>
        <tr>
          {columns.map((col, index) => <th
            key={uid()} className={index === columns.length - 1 ? "text-end" : ""}
            style={{ display: (readOnly && index === columns.length - 1) ? 'none' : '' }}
          >
            {col}
          </th>)}
        </tr>
      </thead>
      <tbody>
        <tr style={{
          borderBottom: '2px solid hsl(180, 100%, 30%)',
          display: readOnly ? 'none' : ''
        }}>
          {rawColumns.map((col, index) => {
            return <td key={index}>
              <Form.Control size='sm' placeholder={col}
                value={newTagAttrs[col] ? newTagAttrs[col] : ''}
                onChange={e => setNewTagAttrs({ ...newTagAttrs, [col]: e.target.value })}
                id={deviceID + col} required
              />
            </td>
          })}
          <td className="text-end hover">
            <Badge className="p-2"
              onClick={addTag}
            >
              <Save size={14} />
            </Badge>
          </td>
        </tr>

        {data.map(row => {
          return row.name !== '' ? <tr key={uid()}>
            {Object.values(row).map((cell, index) => <EditableCell
              key={uid()} initValue={cell}
              deviceID={deviceID}
              tagName={row.name}
              attr={rawColumns[index]}
              protocol={protocol}
              readOnly={readOnly}
            />)}
            <td className="text-end" style={{ display: readOnly ? 'none' : '' }}>
              <Trash size={18}
                className="hover"
                onClick={() => deleteTag(row.name)}
              />
            </td>
          </tr> : null
        })}
      </tbody>
    </table>
  </div>
}

function EditableCell({ initValue, deviceID, tagName, attr, protocol, readOnly }) {
  // We need to keep and update the state of the cell normally
  const [value, setValue] = useState(initValue)
  const [editable, setEditable] = useState(false)
  const dispatch = useDispatch()
  const inputRef = useRef(null)

  // If the initialValue is changed external, sync it up with our state
  const updateValue = () => {
    setEditable(false)
    console.log(value)
    console.log(deviceID, tagName, attr)

    DeviceService.editTagCell(deviceID, protocol, tagName, attr, value).then(response => {
      console.log(response.data)
      dispatch(editTagCell({
        deviceID,
        tagName, attr,
        newValue: value
      }))
    }).catch(err => {
      console.log(err.message)
      setValue(initValue)
    })
  }

  return <td>
    {editable ?
      <Form onSubmit={e => {
        e.preventDefault()
        updateValue()
      }}>
        <Form.Group style={{ width: '80px' }}>
          <Form.Control
            value={value} size='sm'
            onChange={e => setValue(e.target.value)}
            onBlur={() => {
              if (value !== '') {
                setValue(initValue)
                setEditable(false)
              }
              else {
                inputRef.current.focus()
              }
            }}
            ref={inputRef}
            required
          />
        </Form.Group>
      </Form>
      : <span onDoubleClick={() => {
        
        !readOnly && setEditable(true)
      }} className='hover'>
        {value}
      </span>}
  </td>
}