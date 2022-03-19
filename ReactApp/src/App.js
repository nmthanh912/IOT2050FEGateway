import GatewayPage from "./pages/gateway";
import DevicePage from "./pages/device";
import NavBar from './components/navbar'
// import Footer from "./components/footer";
import { Container } from "react-bootstrap";
import { Routes, Route, Navigate } from "react-router-dom"
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchDevices } from "./redux/slices/device";

export default function App() {
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(fetchDevices())
    }, [dispatch])
    return <div>
        <NavBar />
        <Container className="my-3">
            <Routes>
                <Route path='/' element={<Navigate to={'/device'} />} />
                <Route path='/device' element={<DevicePage />} />
                <Route path='/gateway' element={<GatewayPage />} />
            </Routes>
        </Container>
        {/* <Footer /> */}
    </div>
}


