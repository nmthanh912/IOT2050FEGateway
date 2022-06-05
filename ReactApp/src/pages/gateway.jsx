import Modal from '../components/gateway/modal'
import SubHeader from "../components/subHeader";
import { useEffect, useState } from "react";
import GatewayService from "../services/configserver/gateway";
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import removeAccents from "../utils/removeAccents";
import Gateway from "../components/gateway/gateway";

import mqttClient from "../services/gateway"

export default function GatewayPage() {
  const deviceList = useSelector(state => state.device)
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)

  const dispatch = useDispatch()
  const [list, setList] = useState([])

  const [savedQuery, setSavedQuery] = useState('')
  const [currGatewatList, setCurrGatewayList] = useState([])

  const [runningGatewayList, setRunningGatewayList] = useState([])
  useEffect(() => {
    mqttClient.getRunningGateways().then(response => {
      setRunningGatewayList(response.data)
    }).catch(err => toast.error('Cannot get running gateways'))
  }, [])

  useEffect(() => {
    if (savedQuery === '') setCurrGatewayList(list)
  }, [list, savedQuery])

  const searchGateway = query => {
    let arr = list.filter(val => {
      const searchStr = removeAccents(query).toLowerCase()
      const normalGatewayName = removeAccents(val.name).toLowerCase()
      return normalGatewayName.match(searchStr)
    })
    setSavedQuery(query)
    setCurrGatewayList(arr)
  }

  useEffect(() => {
    GatewayService.get().then(response => {
      const gatewayList = []
      response.data.forEach(data => {
        let gateway = {
          ID: data.ID,
          description: data.description,
          name: data.name,
          config: {
            username: data.username,
            password: data.password,
            IP: data.IP,
            port: data.port,
            QoS: data.QoS
          }
        }
        gatewayList.push(gateway)
      })
      setList(gatewayList)
    }).catch(err => console.log(err))

  }, [dispatch, deviceList])

  const addGateway = data => {
    GatewayService.add(data).then(response => {
      setList([...list, { ID: response.data.key, ...data }])
      toast.success(`Create gateway successfully !`)
    }).catch(err => toast.error(err.message))
  }

  const editGateway = data => {
    GatewayService.update(editTarget.ID, data).then(response => {
      const newList = [...list]
      const edittedGateway = newList.find(gateway => gateway.ID === editTarget.ID)
      Object.assign(edittedGateway, data)
      setList(newList)
      toast.success(`Update successfully !`)
    }).catch(err => toast.error(err.message))
  }

  const deleteGateway = gatewayID => {
    GatewayService.delete(gatewayID).then(response => {
      const newList = [...list]
      const idx = newList.findIndex(gateway => gateway.ID === gatewayID)
      newList.splice(idx, 1)
      setList(newList)
      toast.success(`Delete successfully !`)
    }).catch(err => toast.error(err.message))
  }

  return <div>
    <SubHeader
      modal={<Modal
        show={showModal}
        onHide={() => {
          setEditTarget(null)
          setShowModal(false)
        }}
        onSubmit={editTarget ? editGateway : addGateway}
        editTarget={editTarget}
      />}
      onShow={() => setShowModal(true)}
      title='Gateway'
      onSearch={searchGateway}
    />
    <hr />

    {currGatewatList.length !== 0 ? currGatewatList.map(gateway => <Gateway
      data={gateway} key={gateway.ID}
      onEdit={() => {
        setShowModal(true)
        setEditTarget(gateway)
      }}
      onDelete={() => {
        const confirm = window.confirm("Do you want to delete this gateway")
        confirm && deleteGateway(gateway.ID)
        setEditTarget(null)
      }}
      isRunning={runningGatewayList.includes(gateway.ID)}
    />) : <div className='w-100 d-flex justify-content-between'>
      <div className='mx-auto text-secondary mt-5 fs-3'>
        Empty gateway list
      </div>
    </div>}
  </div>
}

