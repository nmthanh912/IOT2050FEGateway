
import DropdownItem from "../dropdownItem";
import PaginateTagList, { TagTable } from "./paginateTagList";
import { useMemo, useRef } from "react";
import { CSVLink } from "react-csv";
import CSVReader from "react-csv-reader";
import { useDispatch } from "react-redux";
import { removeDevice, updateDevice } from "../../redux/slices/device";
import DeviceService from "../../services/device";


const parseOptions = {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: header => header.toLowerCase().replace(/\W/g, "_")
};


export default function EdgeDevice({ data, onDetail }) {
    const downloadCSVRef = useRef(null)
    const uploadCSVRef = useRef(null)
    const dispatch = useDispatch()

    // Convert data of a device into csv data
    const exportData = useMemo(() => {
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
        // console.log(list)
        return list
    }, [data])

    const exportToCSV = () => {
        downloadCSVRef.current.link.click()
    }

    const handleUploadData = (data, fileInfo) => {
        console.log(data)
        let idx = data.findIndex(val => val.id === 'Tag List')
        const tagHeader = Object.values(data[idx + 1])

        while (tagHeader[tagHeader.length - 1] === null)
            tagHeader.pop()

        const tagList = []
        for (let i = idx + 2; i < data.length; ++i) {
            let tag = {}
            let values = Object.values(data[i])
            tagHeader.forEach((header, idx) => {
                tag[header] = values[idx]
            })
            tagList.push(tag)
        }
        dispatch(updateDevice({
            ...data[0],
            tagList,
            config: {}
        }))
    };

    const importCSV = () => {
        let csvReaderInput = uploadCSVRef.current.children[0]
        let input = csvReaderInput.children[1]
        input.click()
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
            onImport={importCSV}
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
                    <div ref={uploadCSVRef}>
                        <CSVReader
                            label="Select CSV"
                            onFileLoaded={handleUploadData}
                            parserOptions={parseOptions}
                        />
                    </div>
                </div>
            </DropdownItem.Header>
            <DropdownItem.Body>
                <PaginateTagList deviceID={data.ID} protocol={data.protocol} Table={TagTable} />
            </DropdownItem.Body>
        </DropdownItem>
        
    </div>
}