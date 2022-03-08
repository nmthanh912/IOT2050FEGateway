import ReactPaginate from "react-paginate"
import { FormGroup, FormSelect, FormText, FormControl } from "react-bootstrap"
import { useState, useEffect, useMemo } from "react";
import { CaretLeft, CaretRight } from "react-bootstrap-icons";
import ShortUniqueId from "short-unique-id";
import { useSelector, useDispatch } from "react-redux";
import { fetchTags } from "../../redux/slices/device"

const uid = new ShortUniqueId({
  length: 5,
  dictionary: 'hex'
})

export default function PaginateTagList({ deviceID, protocol, Table }) {
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
    // Fetch items from another resources.
    const endIdx = beginIdx + itemsPerPage;
    // console.log(beginIdx + '\t' + endIdx);
    setCurrentItems(tagList.slice(beginIdx, endIdx));
    setPageCount(Math.ceil(tagList.length / itemsPerPage));
  }, [beginIdx, itemsPerPage, tagList]);

  // Fetch tag of a device from DB
  useEffect(() => {
    dispatch(fetchTags({ deviceID, protocol }))
  }, [deviceID, protocol, dispatch])

  const pageClick = event => {
    const newBeginIdx = (event.selected * itemsPerPage) % tagList.length;
    setBeginIdx(newBeginIdx);
  };

  const resetState = (newItemsPerPage) => {
    // Set page to 0
    setCurrentItems(tagList.slice(0, newItemsPerPage))
    setPageCount(0)
    setItemsPerPage(newItemsPerPage)
  }

  return (
    <div>
      {currentItems.length !== 0 && <Table data={currentItems} />}
      <div className="d-flex align-items-center justify-content-end">
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
          containerClassName={'pagination m-3'}
          pageClassName={'page-item'}
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

export function TagTable({ data }) {
  const columns = useMemo(() => {
    return Object.keys(data[0]).map(key => key[0].toUpperCase() + key.slice(1))
  }, [data])

  return <div>
    <table className="styled-table w-100" >
      <thead>
        <tr>
          {columns.map(col => <th key={uid()} >
            {col}
          </th>)}
        </tr>
      </thead>
      <tbody>
        {data.map(row => {
          return <tr key={uid()}>
            {Object.values(row).map(cell => <EditableCell key={uid()} initValue={cell} />)}
          </tr>
        })}
      </tbody>
    </table>
  </div>
}

function EditableCell({ initValue }) {
  // We need to keep and update the state of the cell normally
  const [value, setValue] = useState(initValue)
  const [editable, setEditable] = useState(false)
  // console.log(column)
  // If the initialValue is changed external, sync it up with our state

  return <td>
    {editable ?
      <FormGroup className='w-50'>
        <FormControl
          value={value} size='sm'
          onChange={e => setValue(e.target.value)}
          onBlur={() => setEditable(false)}
        />
      </FormGroup>
      : <span onDoubleClick={() => setEditable(true)} className='hover'>{value}</span>}
  </td>

}