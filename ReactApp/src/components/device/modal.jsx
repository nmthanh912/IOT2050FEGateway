import {useEffect, useRef, useState} from 'react'
import {Modal, Form, Button} from 'react-bootstrap'
import DeviceService from '../../services/device'
import {useDispatch} from 'react-redux'
import {addDevice, updateDevice, updateTagList} from '../../redux/slices/device'
import CSVReader from './CSVImporter'
import {toast, ToastContainer} from 'react-toastify'
import {SuccessMessage, FailMessage} from '../toastMsg'
import shortId from '../../utils/shortId'

export default function DeviceModal({show, onHide, device, mode}) {
    const [draftInfo, setDraftInfo] = useState(initState)
    const csvRef = useRef(null)
    const dispatch = useDispatch()
    const [replicateNumber, setReplicateNumber] = useState(1)

    const setName = (name) => setDraftInfo({...draftInfo, name})
    const setDescription = (description) => setDraftInfo({...draftInfo, description})
    const setProtocol = (value) => {
        let protocol = deviceConfigInfo.find((p) => p.value === value)
        setDraftInfo({...draftInfo, protocol, config: {}})
    }

    const setConfig = (config) => setDraftInfo({...draftInfo, config})

    const updateToDB = async () => {
        try {
            let tagList = []
            if (device.tagList.length === 0) {
                const res1 = await DeviceService.getTags(device.ID, device.protocol)
                dispatch(
                    updateTagList({
                        deviceID: device.ID,
                        data: res1.data,
                    })
                )
                tagList = res1.data
            } else {
                tagList = device.tagList
            }

            const data = {
                ...draftInfo,
                protocol: draftInfo.protocol.value.toUpperCase(),
                tagList: draftInfo.tagList.length !== 0 ? draftInfo.tagList : tagList,
            }

            await DeviceService.editDevice(device.ID, data)
            delete data.config
            delete data.protocol
            console.log(data)
            dispatch(
                updateDevice({
                    ID: device.ID,
                    ...data,
                })
            )
            notifySuccess('Update device successfully')
        } catch (err) {
            notifyFail(err.message)
        }
    }

    useEffect(() => {
        console.log(device)
        if (mode === 'edit') {
            DeviceService.getConfigInfoById(device.ID, device.protocol)
                .then((res) => {
                    setDraftInfo({
                        ...device,
                        protocol: deviceConfigInfo.find((cInfo) => cInfo.value.toUpperCase() === device.protocol),
                        config: res.data,
                    })
                })
                .catch((err) => {
                    console.log(err)
                })
        }
    }, [device, mode])

    const notifySuccess = (msg) =>
        toast(<SuccessMessage msg={msg} />, {
            progressClassName: 'Toastify__progress-bar--success',
        })
    const notifyFail = (msg) =>
        toast(<FailMessage msg={msg} />, {
            progressClassName: 'Toastify__progress-bar--error',
        })

    const addDeviceToDB = () => {
        const newDevice = {
            ...draftInfo,
            protocol: draftInfo.protocol.value.toUpperCase(),
        }
        DeviceService.add(newDevice, replicateNumber)
            .then((response) => {
                delete newDevice.config
                if (!Array.isArray(response.data)) dispatch(addDevice({ID: response.data.key, ...newDevice}))
                notifySuccess('Add device successfully !')
                setDraftInfo(initState)
                // setReplicateNumber(1)
                onHide()
            })
            .catch((err) => {
                notifyFail('Some error occurred !')
                console.log(err)
            })
    }

    const handleUploadFile = (file) => {
        console.log(file)
        try {
            const removedNullData = file.data.map((row) => row.filter((val) => val !== ''))
            if (mode === 'edit') {
                if (removedNullData[1][7].toLowerCase() !== draftInfo.protocol.value.toLowerCase())
                    throw new Error('Protocol cannot be changed')
            }

            // Find the first line which taglist/config begin in excel file
            const tagListOffset = removedNullData.findIndex((val) => val[0] === 'Tag List') + 1
            const configOffset = removedNullData.findIndex((val) => val[0] === 'Configurations') + 1

            const tagListLength = file.data.length - tagListOffset - 2

            const newTagList = []
            for (let i = 0; i < tagListLength; ++i) {
                let tag = {}
                for (let j in removedNullData[tagListOffset]) {
                    tag[removedNullData[tagListOffset][j]] = removedNullData[tagListOffset + i + 1][j]
                }
                newTagList.push(tag)
            }

            const newConfig = {}
            for (let i in removedNullData[configOffset]) {
                newConfig[removedNullData[configOffset][i]] = removedNullData[configOffset + 1][i]
            }

            const obj = {
                name: removedNullData[1][1],
                description: removedNullData[1][2],
                byteOrder: removedNullData[1][3],
                wordOrder: removedNullData[1][4],
                scanningCycle: removedNullData[1][5],
                minRespTime: removedNullData[1][6],
                protocol: deviceConfigInfo.find(
                    (val) => val.value.toLowerCase() === removedNullData[1][7].toLowerCase()
                ),
                tagList: newTagList,
                config: newConfig,
            }
            setDraftInfo(obj)
            console.log(obj)
        } catch (err) {
            notifyFail(err.message)
        }
    }

    return (
        <div>
            <ToastContainer
                closeOnClick
                pauseOnHover={false}
                position='top-right'
                autoClose={1800}
                containerId={shortId()}
            />
            <Modal show={show} onHide={onHide}>
                <Modal.Header className='bg-primary text-white'>
                    <h5 className='m-auto'>{mode === 'add' ? 'Add new device' : 'Edit device'}</h5>
                </Modal.Header>
                <Modal.Body>
                    <Form
                        onSubmit={(e) => {
                            e.preventDefault()
                            mode === 'add' && addDeviceToDB()
                            mode === 'edit' && updateToDB()
                            onHide()
                        }}
                    >
                        {/* Enter device info */}
                        <div className='row mb-2'>
                            <div ref={csvRef} className='mb-1'>
                                <CSVReader handleUpload={handleUploadFile} />
                            </div>
                            <Form.Group className='col-6'>
                                <Form.Label>Device name:</Form.Label>
                                <Form.Control
                                    value={draftInfo.name}
                                    size='sm'
                                    placeholder='Device name ...'
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className='col-6'>
                                <Form.Label>Protocol:</Form.Label>
                                <Form.Select
                                    size='sm'
                                    value={draftInfo.protocol.value}
                                    onChange={(e) => setProtocol(e.target.value)}
                                    placeholder='Select protocol'
                                    required
                                    disabled={mode === 'edit'}
                                >
                                    {deviceConfigInfo.map((protocol) => {
                                        return (
                                            <option value={protocol.value} key={protocol.value}>
                                                {protocol.label}
                                            </option>
                                        )
                                    })}
                                </Form.Select>
                            </Form.Group>
                        </div>

                        <div className='row'>
                            <Form.Group className='col-6'>
                                <Form.Label>Byte order:</Form.Label>

                                <Form.Select
                                    value={draftInfo.byteOrder}
                                    size='sm'
                                    placeholder='Byte order ...'
                                    onChange={(e) => setDraftInfo({...draftInfo, byteOrder: e.target.value})}
                                    required
                                >
                                    <option value={''} disabled>
                                        -- Select --
                                    </option>
                                    <option value={'BigEndian'}>Big Endian</option>
                                    <option value={'LittleEndian'}>Little Endian</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className='col-6'>
                                <Form.Label>Word order:</Form.Label>
                                <Form.Select
                                    value={draftInfo.wordOrder}
                                    size='sm'
                                    placeholder='Word order ...'
                                    onChange={(e) => setDraftInfo({...draftInfo, wordOrder: e.target.value})}
                                    required
                                >
                                    <option value={''} disabled>
                                        -- Select --
                                    </option>
                                    <option value={'BigEndian'}>Big Endian</option>
                                    <option value={'LittleEndian'}>Little Endian</option>
                                </Form.Select>
                            </Form.Group>
                        </div>

                        <div className='row'>
                            <Form.Group className='col-6'>
                                <Form.Label>Scanning cycle:</Form.Label>
                                <Form.Control
                                    type='number'
                                    value={draftInfo.scanningCycle}
                                    size='sm'
                                    placeholder='Second ...'
                                    min={1}
                                    onChange={(e) =>
                                        setDraftInfo({...draftInfo, scanningCycle: parseInt(e.target.value)})
                                    }
                                    required
                                />
                            </Form.Group>

                            <Form.Group className='col-6'>
                                <Form.Label>Minimum response time:</Form.Label>
                                <Form.Control
                                    type='number'
                                    value={draftInfo.minRespTime}
                                    size='sm'
                                    placeholder='Milisecond ...'
                                    onChange={(e) =>
                                        setDraftInfo({...draftInfo, minRespTime: parseInt(e.target.value)})
                                    }
                                    required
                                    min={1}
                                />
                            </Form.Group>
                        </div>

                        <Form.Group>
                            <Form.Label>Description:</Form.Label>
                            <Form.Control
                                type='text'
                                as='textarea'
                                size='sm'
                                placeholder='Description ...'
                                value={draftInfo.description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Form.Group>
                        {mode === 'add' && (
                            <Form.Group className='mt-2'>
                                <Form.Label>Replicate Number:</Form.Label>
                                <Form.Control
                                    type='number'
                                    size='sm'
                                    value={replicateNumber}
                                    min={1}
                                    onChange={(e) => setReplicateNumber(parseInt(e.target.value))}
                                    required
                                    placeholder='Default by 1'
                                />
                                <Form.Text className='text-muted'>
                                    This number indicates how many anologous devices you want to create.
                                </Form.Text>
                            </Form.Group>
                        )}

                        {/* Enter config info */}
                        <hr />
                        <h5>
                            <b>Configuration Info</b>
                        </h5>
                        {draftInfo.protocol.attrs.map((attr) => {
                            const attrName = attr.name.charAt(0).toUpperCase() + attr.name.slice(1)
                            const key = attrName.toLowerCase()
                            return (
                                <Form.Group key={attr.name} className='mb-2'>
                                    <Form.Label>{attrName}:</Form.Label>
                                    {attr.type ? (
                                        <Form.Control
                                            size='sm'
                                            required
                                            type={attr.type}
                                            placeholder={attrName + ' ...'}
                                            value={draftInfo.config[key] ? draftInfo.config[key] : ''}
                                            onChange={(e) => setConfig({...draftInfo.config, [key]: e.target.value})}
                                        />
                                    ) : (
                                        <Form.Select
                                            value={draftInfo.config[key] ? draftInfo.config[key] : ''}
                                            onChange={(e) => setConfig({...draftInfo.config, [key]: e.target.value})}
                                            size='sm'
                                            required
                                        >
                                            <option value={''} disabled>
                                                ------
                                            </option>
                                            {attr.options.map((opt) => (
                                                <option value={opt} key={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    )}
                                </Form.Group>
                            )
                        })}

                        {/* Submit button */}
                        <div className='d-flex justify-content-end mt-2'>
                            <Button className='ms-2 text-white fw-bold' type='submit'>
                                Submit
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    )
}

const deviceConfigInfo = [
    {
        value: 'MODBUSRTU',
        label: 'Modbus RTU',
        attrs: [
            {
                name: 'com_port_num',
                type: 'text',
            },
            {
                name: 'parity',
                options: ['none', 'odd', 'even'],
            },
            {
                name: 'slaveID',
                type: 'number',
            },
            {
                name: 'baudrate',
                type: 'number',
            },
            {
                name: 'stopbits',
                type: 'number',
            },
            {
                name: 'databits',
                type: 'number',
            },
        ],
    },
    {
        value: 'MODBUSTCP',
        label: 'Modbus TCP',
        attrs: [
            {
                name: 'IP',
                type: 'text',
            },
            {
                name: 'port',
                type: 'number',
            },
            {
                name: 'slaveID',
                type: 'number',
            },
        ],
    },
    {
        value: 'OPC_UA',
        label: 'OPC UA',
        attrs: [{name: 'URL', type: 'url'}],
    },
]

const initState = {
    name: '',
    description: '',
    byteOrder: '',
    wordOrder: '',
    scanningCycle: '',
    minRespTime: '',
    protocol: deviceConfigInfo[0],
    tagList: [],
    config: {},
}
