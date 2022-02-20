import Header from "../components/header";
import Device from "../components/device";
import DeviceModal from "../components/deviceModal";
import { useState } from "react";

export default function Main() {
    const [showEditModal, setShowEditModal] = useState(false)
    return <div>
        <Header />
        <hr />
        <Device edit={() => setShowEditModal(true)}/>
        <Device edit={() => setShowEditModal(true)}/>
        <Device edit={() => setShowEditModal(true)}/>
        <Device edit={() => setShowEditModal(true)}/>
        <DeviceModal show={showEditModal} setShow={setShowEditModal} />
    </div>

}