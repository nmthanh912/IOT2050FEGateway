import { Button, FormControl, FormGroup, InputGroup } from 'react-bootstrap'
import { Search, NodePlus } from 'react-bootstrap-icons'

export default function SubHeader({ modal, onShow, title }) {

    return <div className="row mt-3">
        <InputGroup className='col m-0'>
            <FormControl type='text' placeholder='Search ...' size='sm'/>
            <Button className='hover text-white'><Search /></Button>
        </InputGroup>
        <FormGroup className='col-auto m-0'>
            <Button className='ms-2 d-flex align-items-center text-white' onClick={onShow} style={{fontWeight: 600}}>
                Add {title} <NodePlus size={18} className='ms-2'/>
            </Button>
        </FormGroup>
        {modal}
    </div>
}