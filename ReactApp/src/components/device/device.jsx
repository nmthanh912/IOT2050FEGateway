

import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";

import { removeDevice, updateTagList } from "../../redux/slices/device";

import DeviceService from "../../services/device";
import shortId from "../../utils/shortId";
import HardwareServices from "../../services/protocol";

import { toast, ToastContainer } from 'react-toastify'
import { SuccessMessage, FailMessage } from "../toastMsg";
import BootstrapSwitchButton from 'bootstrap-switch-button-react'
import DropdownItem from "../dropdownItem";
import PaginateTagList, { TagTable } from "./paginateTagList";
import { CSVLink } from "react-csv";
import { Button } from "react-bootstrap";

export default function EdgeDevice({ data, onDetail }) {
    const downloadCSVRef = useRef(null)
    const dispatch = useDispatch()
    const [exportData, setExportData] = useState([])
    const [poweron, setPoweron] = useState(false)
    const [disabledToggle, setDisableToggle] = useState(false)

    // console.log(data)
    const exportToCSV = () => {
        const list = [[], [], ['-----------']]
        Object.keys(data).forEach(key => {
            if (key !== 'tagList' && key !== 'config') {
                list[0].push(key)
                list[1].push(data[key])
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
                console.log([...list])
            }
            catch (err) {
                notifyFail(err.message)
            }
        }
        loadData()
    }

    useEffect(() => {
        if (exportData.length !== 0) downloadCSVRef.current.link.click()
    }, [exportData, downloadCSVRef])

    const deleteDevice = () => {
        const confirm = window.confirm("Are you sure about deleting this device ?")
        confirm && DeviceService.deleteDevice(data.ID, data.protocol).then(res => {
            dispatch(removeDevice(data.ID))
            notifySuccess('Delete device successfully')
        }).catch(err => {
            notifyFail(err.message)
        })
    }

    const notifySuccess = msg => toast(<SuccessMessage msg={msg} />, {
        progressClassName: 'Toastify__progress-bar--success'
    })
    const notifyFail = msg => toast(<FailMessage msg={msg} />, {
        progressClassName: 'Toastify__progress-bar--error'
    })

    const turnOnDevice = () => {
        console.log("POWERON")
        HardwareServices.poweron(data.protocol, data.ID).then(res => console.log(res.data))
    }
    const shutdownDevice = () => {
        console.log("SHUTDOWN")
        HardwareServices.shutdown(data.protocol, data.ID).then(res => console.log(res.data))
    }

    return <div>
        <ToastContainer
            autoClose={1800}
            pauseOnHover={false}
            closeOnClick
            containerId={shortId()}
        />
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