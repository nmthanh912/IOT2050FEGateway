import { useState } from "react";
import { Navbar } from "react-bootstrap";
import { Link } from 'react-router-dom'
import Logo from './logo.png'

export default function NavBar() {
    const [active, setActive] = useState(0)
    return <Navbar bg="dark" variant="dark" className="d-flex justify-content-between px-5 sticky-top">
        <Navbar.Brand href="#home">
            <img alt="Logo" src={Logo} width={40} height={40} />
            IOT2050FE
        </Navbar.Brand>
        <div>
            <Link
                to={'/edge-device'}
                className={"me-3 text-decoration-none " + (active === 0 ? "text-white" : "text-secondary")}
                onClick={() => setActive(0)}
            >
                Edge Device
            </Link><Link
                to={'/gateway'}
                className={"text-decoration-none " + (active === 1 ? "text-white" : "text-secondary")}
                onClick={() => setActive(1)}
            >
                Gateway
            </Link>
        </div>
    </Navbar>
}