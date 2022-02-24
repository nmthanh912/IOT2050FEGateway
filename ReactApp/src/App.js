import Gateway from "./pages/gateway";
import Edge from "./pages/edge";
import NavBar from './components/navbar'
// import Footer from "./components/footer";
import { Container } from "react-bootstrap";

import { Routes, Route } from "react-router-dom"

export default function App() {
    return <div>
        <NavBar />
        <Container className="mt-3">
            <Routes>
                <Route path='/' element={<Edge />} />
                <Route path='/edge-device' element={<Edge />} />
                <Route path='/gateway' element={<Gateway />} />
            </Routes>
        </Container>
        {/* <Footer /> */}
    </div>
}


