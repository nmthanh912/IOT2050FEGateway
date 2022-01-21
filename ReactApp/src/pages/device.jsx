import Header from '../components/device/header'
import Table from '../components/device/table'
import { useState } from 'react'
import ShortUniqueId from "short-unique-id";

const uid = new ShortUniqueId({ length: 7 });
const dStatus = ['Configured', 'Unconfigured']

export default function Device() {
    const [list, setList] = useState([
        {
            id: uid(),
            name: "Thiết bị PLC",
            description: "Đo nhiệt độ, độ ẩm",
            status: dStatus[0]
        },
        {
            id: uid(),
            name: "Yichun C02 YC130",
            description: "",
            status: dStatus[1]
        },
    ])
    return <div>
        <h5>Add new device</h5>
        <Header list={list} setList={setList} />
        <hr />
        <Table list={list} setList={setList} />
    </div >
}