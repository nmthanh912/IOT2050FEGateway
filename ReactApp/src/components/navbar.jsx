import { Justify } from 'react-bootstrap-icons'
import { Button } from 'react-bootstrap'

export default function Navbar({ expand, setExpand }) {
    return <nav className="navbar navbar-expand-lg navbar-dark sticky-top"
        style={{
            backgroundColor: '#1d1d1d',
            borderLeft: '1px solid rgba(173, 173, 173, 0.2)'
        }}>
        <div className="container-fluid">
            <Button variant='dark' onClick={() => setExpand(expand)}>
                <Justify className='text-white' />
            </Button>
        </div>
    </nav>
}