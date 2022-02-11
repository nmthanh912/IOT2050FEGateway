import { useState } from "react";
import { PlusCircleFill, Search } from "react-bootstrap-icons";
import AddModal from "../components/config/modal";
import { InputGroup, FormControl } from "react-bootstrap";
import Item from '../components/config/item'

export default function Config() {
    const [showBox, setShowBox] = useState(false)

    return <div>
        <AddModal show={showBox} setShow={setShowBox} />
        <div className="d-flex justify-content-between align-items-center">
            <InputGroup>
                <FormControl placeholder="Search by device ..." />
                <InputGroup.Text className="bg-dark text-white">
                    <Search />
                </InputGroup.Text>
            </InputGroup>
            <PlusCircleFill
                size={35}
                className='hover text-dark ms-3'
                onClick={() => setShowBox(true)}
            />
        </div>
        <hr />
        {/* <Item>
            <Item.Header>
                <span>{configList[0].device.name}</span>
            </Item.Header>
        </Item> */}
    </div>
}

// const configList = [{
//     device: {
//         id: 'id1',
//         name: 'Thiết bị PLC'
//     },
//     protocol: 'ModbusRTU',
//     tags: [{
//         id: 'id2',
//         name: 'Tag đo độ ẩm'
//     }],
//     info: {
//         'IP': '192.168.0.1',
//         'port': 3000,
//         'slave': '247'
//     }
// }]