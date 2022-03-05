import { useState } from "react";
import { Navbar } from "react-bootstrap";
import { Link } from 'react-router-dom'
import Logo from './logo.png'

export default function NavBar() {
    const [active, setActive] = useState(0)
    return <Navbar variant="dark" className="d-flex justify-content-between px-5 sticky-top bg-primary" >
        <Navbar.Brand href="#home" className="fw-bold">
            <img alt="Logo" src={Logo} width={40} height={40} />
            IOT2050FE
        </Navbar.Brand>
        <div>
            <Link
                to={'/device'}
                className={"me-3 text-decoration-none " + (active === 0 ? "fw-bold text-white" : "text-secondary")}
                onClick={() => setActive(0)}
            >
                Device
            </Link><Link
                to={'/gateway'}
                className={"text-decoration-none " + (active === 1 ? "fw-bold text-white" : "text-secondary")}
                onClick={() => setActive(1)}
            >
                Gateway
            </Link>
        </div>
    </Navbar>
}