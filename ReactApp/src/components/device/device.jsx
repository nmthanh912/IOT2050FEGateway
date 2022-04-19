import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { removeDevice, updateTagList } from "../../redux/slices/device";

import DeviceService from "../../services/configserver/device";
import HardwareServices from "../../services/protocol";

import { toast } from 'react-toastify'
import BootstrapSwitchButton from 'bootstrap-switch-button-react'
import DropdownItem from "../dropdownItem";
import PaginateTagList, { TagTable } from "./paginateTagList";
import { CSVLink } from "react-csv";
import { Button } from "react-bootstrap";

export default function EdgeDevice({ data, onDetail, isRunning }) {
    const downloadCSVRef = useRef(null)
    const dispatch = useDispatch()
    const [exportData, setExportData] = useState([])
    const [poweron, setPoweron] = useState(isRunning)
    const [disabledToggle, setDisableToggle] = useState(false)

    const exportToCSV = () => {

        const list = [
            ['DO NOT:'],
            [' *** LEAVE ANY BLANK CELLS IN A SUBTABLE  ***'],
            [' *** LEAVE ANY BLANK ROWS BETWEEN SUBTABLES ***'],
            [' *** RENAME SUBTABLES (i.e, Device Info, Configurations) ***'],
            [' *** REORDER SUBTABLES (i.e, Device Info, Configurations) ***'],
            [' *** RENAME COLUMNS ***'],
            [' *** REORDERS COLUMNS ***'],
            ['Any errors caused by violations of above warnings WON\'T BE THROWN !'],
            ['-----------'],
            ['Device Info'],
            [],
            [],
            ['-----------']
        ]
        Object.keys(data).forEach(key => {
            if (key !== 'tagList' && key !== 'config') {
                list[10].push(key)
                list[11].push(data[key])
            }
        })

        async function loadData() {
            try {
                let tagList
                if (data.tagList.length === 0) {
                    console.log("LOAD FROM DB")
                    const response = await DeviceService.getTags(data.ID, data.protocol)
                    dispatch(updateTagList({
                        deviceID: data.ID,
                        data: response.data
                    }))
                    tagList = response.data
                }
                else {
                    console.log("LOAD FROM STORE")
                    tagList = data.tagList
                }
                const res = await DeviceService.getConfigInfoById(data.ID, data.protocol)

                list.push(['Configurations'])
                list.push(Object.keys(res.data))
                list.push(Object.values(res.data))

                list.push(['-----------'])
                list.push(['Tag List'])
                list.push(Object.keys(tagList[0]))
                for (let i = 0; i < tagList.length; ++i) {
                    list.push(Object.values(tagList[i]))
                }

                setExportData([...list])
            }
            catch (err) {
                notifyFail(err.message)
            }
        }
        loadData()
    }

    useEffect(() => {
        setPoweron(isRunning)
    }, [isRunning])

    useEffect(() => {
        if (exportData.length !== 0) downloadCSVRef.current.link.click()
    }, [exportData, downloadCSVRef])

    const deleteDevice = () => {
        const confirm = window.confirm("Are you sure about deleting this device ?")
        confirm && DeviceService.deleteDevice(data.ID, data.protocol).then(res => {
            dispatch(removeDevice(data.ID))
            notifySuccess('Delete device successfully')
        }).catch(err => {
            console.log(err)
            // notifyFail(err.response.data.msg)
        })
    }

    const notifySuccess = msg => toast.success(msg, {
        progressClassName: 'Toastify__progress-bar--success',
        toastId: "deviceSuccess"
    })

    const notifyFail = msg => toast.error(msg, {
        progressClassName: 'Toastify__progress-bar--error',
        toastId: "deviceFail"
    })

    const turnOnDevice = () => {
        HardwareServices.poweron(data.protocol, data.ID).then(
            res => console.log(res.data)
        ).catch(err => {
            notifyFail(err.response ? err.response.data.msg : err.message)
            setPoweron(false)
        })
    }
    const shutdownDevice = () => {
        HardwareServices.shutdown(data.protocol, data.ID).then(res => console.log(res.data))
    }

    return <div>
        <DropdownItem
            onEdit={poweron ? null : () => onDetail()}
            onExport={exportToCSV}
            onDelete={deleteDevice}
            key={data.ID}
        >
            <DropdownItem.Header>
                <div className="row justify-content-between">
                    <div className="text-primary col-3"><u>#{data.ID}</u></div>
                    <div className="fw-bold col-4">{data.name}</div>
                    <div className="col-4">{data.description}</div>
                    <div className="col-1 text-end">
                        <Button disabled={disabledToggle} style={{
                            padding: 0,
                            background: 'transparent',
                            outline: '0!important',
                            border: 'none'
                        }}>
                            <BootstrapSwitchButton
                                checked={poweron}
                                size='xs'
                                onChange={checked => {
                                    if (disabledToggle) {
                                        return
                                    }
                                    setDisableToggle(true)
                                    setTimeout(() => setDisableToggle(false), 3000)
                                    if (poweron) shutdownDevice()
                                    else turnOnDevice()
                                    setPoweron(checked)
                                }}
                            />
                        </Button>
                    </div>
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
                <PaginateTagList
                    deviceID={data.ID}
                    protocol={data.protocol}
                    Table={TagTable}
                    readOnly={poweron}
                />
            </DropdownItem.Body>
        </DropdownItem>
    </div>
}