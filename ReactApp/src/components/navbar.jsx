
import { Navbar } from "react-bootstrap";
import { NavLink } from 'react-router-dom'
import Logo from './logo.png'

export default function NavBar() {
    return <Navbar variant="dark" className="d-flex justify-content-between px-5 sticky-top bg-primary" >
        <Navbar.Brand href="#home" className="fw-bold">
            <img alt="Logo" src={Logo} width={40} height={40} />
            IOT2050FE
        </Navbar.Brand>
        <div>
            {paths.map((path, index) => <NavLink
                key={index}
                to={path}
                className={({ isActive }) =>
                    (index === path.length - 1 ? "" : "me-3 ")
                    + "text-decoration-none "
                    + (isActive ? "fw-bold text-white" : "text-secondary")
                }

            >
                {path[1].toUpperCase() + path.slice(2)}
            </NavLink>)}
        </div>
    </Navbar >
}

const paths = ['/device', '/gateway']