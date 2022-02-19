import { InputGroup, FormControl, Button } from "react-bootstrap";
import { Search, NodePlus } from 'react-bootstrap-icons'
import { useState } from 'react'
// import { useDispatch } from 'react-redux'
import MqttModal from './MqttModal'



export default function Header() {
  const [searchText, setSearchText] = useState('');
  const [showBox, setShowBox] = useState(false)
  // const dispatch = useDispatch()

  const searchTagByName = (name) => {
    alert(name);
    setSearchText('')
  }

  return <div className='d-flex justify-content-between'>
    <div>
      <InputGroup>
        <InputGroup.Text>Find</InputGroup.Text>
        <FormControl
          type="text"
          placeholder="Search by tag name..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
        <Button
          className="d-flex align-items-center"
          onClick={() => searchTagByName(searchText)}
        >
          <Search fontWeight={600} />
        </Button>
      </InputGroup>
    </div>
    <Button
      variant="dark"
      onClick={() => setShowBox(true)}
    >
      Add Tag <NodePlus />
    </Button>

    <MqttModal show={showBox} setShow={setShowBox} />
  </div>
}
