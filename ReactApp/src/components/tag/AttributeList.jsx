import Attribute from './Attribute'
import styled from 'styled-components'
import { Plus } from 'react-bootstrap-icons'
import { Button } from 'react-bootstrap'

const AddBtn = styled(Button)`
    padding: 0.15rem 0.5rem;
`;

export default function AttributeList() {
    return <div>
        <Attribute />
        <Attribute />
        <Attribute />
        <AddBtn variant='success' className='focus-input-off d-flex align-items-center'>
            Add attr <Plus size={23} fontWeight='bold' />
        </AddBtn>
    </div>
}