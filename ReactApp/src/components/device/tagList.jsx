import ReactPaginate from "react-paginate"
import { FormGroup, FormSelect, FormText, Table } from "react-bootstrap"
import { useState, useEffect } from "react";
import { CaretLeft, CaretRight } from "react-bootstrap-icons";
import ShortUniqueId from "short-unique-id";
import { useSelector, useDispatch } from "react-redux";
import { fetchTags } from "../../redux/slices/device"

const uid = new ShortUniqueId({
  length: 5,
  dictionary: 'hex'
})

export default function TagList({ deviceID, protocol }) {
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
      {currentItems.length !== 0 && <TagTable data={currentItems} />}
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
          containerClassName={'pagination'}
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

function TagTable({ data }) {
  return <div>
    <Table striped bordered hover size="sm">
      <thead>
        <tr>
          {Object.keys(data[0]).map(key => <th key={uid()}>{key}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map(data => <tr key={uid()}>
          {Object.values(data).map(value => <td key={uid()}>{value}</td>)}
        </tr>)}
      </tbody>
    </Table>
  </div>
}

// const tagData = [{
//   name: 'Nhiet do 1',
//   unit: 'K',
//   topicAddr: '/device1/nhietdo1'
// }, {
//   name: 'Ap suat',
//   unit: 'Bar',
//   topicAddr: '/device1/apsuat1'
// }, {
//   name: 'Nhiet do 2',
//   unit: 'K',
//   topicAddr: '/device1/nhietdo2'
// }, {
//   name: 'Ap suat 2',
//   unit: 'Bar',
//   topicAddr: '/device1/apsuat2'
// }]