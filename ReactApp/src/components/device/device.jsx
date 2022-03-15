
import DropdownItem from "../dropdownItem";
import PaginateTagList, { TagTable } from "./paginateTagList";
import { useEffect, useState, useRef } from "react";
import { CSVLink } from "react-csv";
import { useDispatch } from "react-redux";
import { removeDevice } from "../../redux/slices/device";
import DeviceService from "../../services/device";


export default function EdgeDevice({ data, onDetail }) {
    const downloadCSVRef = useRef(null)
    const dispatch = useDispatch()
    const [exportData, setExportData] = useState([])

    // Convert data of a device into csv data
    useEffect(() => {
        const list = [[], [], ['-----------']]
        Object.keys(data).forEach(key => {
            if (key !== 'tagList' && key !== 'config') {
                list[0].push(key)
                list[1].push(data[key])
            }
        })
        list.push(['Tag List'])
        if (data.tagList.length !== 0) {
            list.push(Object.keys(data.tagList[0]))
            for (let i = 0; i < data.tagList.length; ++i) {
                list.push(Object.values(data.tagList[i]))
            }
        }
        DeviceService.getConfigInfoById(data.ID, data.protocol).then(res => {
            list.push(['-----------'])
            list.push(['Configurations'])
            list.push(Object.keys(res.data))
            list.push(Object.values(res.data))
            setExportData(list)
        }).catch(err => console.log(err))
    }, [data])

    const exportToCSV = () => {
        downloadCSVRef.current.link.click()
    }

    const deleteDevice = () => {
        const confirm = window.confirm("Are you sure about deleting this device ?")
        confirm && DeviceService.deleteDevice(data.ID, data.protocol).then(res => {
            dispatch(removeDevice(data.ID))
        }).catch(err => {
            console.log(err)
        })
    }

    return <div>
        <DropdownItem
            onEdit={() => onDetail()}
            onExport={exportToCSV}
            onDelete={deleteDevice}
            key={data.ID}
        >
            <DropdownItem.Header>
                <div className="row">
                    <div className="text-primary col-3"><u>#{data.ID}</u></div>
                    <div className="fw-bold col-4">{data.name}</div>
                    <div className="col-5">{data.description}</div>
                </div>
                <div style={{ display: 'none' }}>
                    <CSVLink
                        filename={data.name}
                        data={exportData}
                        ref={downloadCSVRef}
                    >
                        Download
                    </CSVLink>
                </div>
            </DropdownItem.Header>
            <DropdownItem.Body>
                <PaginateTagList deviceID={data.ID} protocol={data.protocol} Table={TagTable} />
            </DropdownItem.Body>
        </DropdownItem>

    </div>
}