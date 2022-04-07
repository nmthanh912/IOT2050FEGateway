import DropdownItem from "../components/dropdownItem";
import Modal from '../components/gateway/modal'
import SubHeader from "../components/subHeader";
import MappingList from "../components/gateway/mappingList";
import { useEffect, useState } from "react";
import GatewayService from "../services/gateway";
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import removeAccents from "../utils/removeAccents";
import shortId from "../utils/shortId";

export default function GatewayPage() {
  const deviceList = useSelector(state => state.device)
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)

  const dispatch = useDispatch()
  const [list, setList] = useState([])

  const [savedQuery, setSavedQuery] = useState('')
  const [currGatewatList, setCurrGatewayList] = useState([])

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

  const notifySuccess = msg => toast.success(msg, {
    progressClassName: 'Toastify__progress-bar--success',
    toastId: 'gatewaySuccess'
  })
  const notifyFail = msg => toast.error(msg, {
    progressClassName: 'Toastify__progress-bar--error',
    toastId: 'gatewayFail'
  })

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
            port: data.port
          }
        }
        gatewayList.push(gateway)
      })
      setList(gatewayList)
    }).catch(err => console.log(err))

  }, [dispatch, deviceList])

  const addGateway = data => {
    console.log(data)
    GatewayService.add(data).then(response => {
      console.log(response.data)
      setList([...list, { ID: response.data.key, ...data }])
      notifySuccess(`Create gateway successfully !`)
    }).catch(err => notifyFail(err.message))
  }

  const editGateway = data => {
    GatewayService.update(editTarget.ID, data).then(response => {
      const newList = [...list]
      const edittedGateway = newList.find(gateway => gateway.ID === editTarget.ID)
      Object.assign(edittedGateway, data)
      setList(newList)
      notifySuccess(`Update successfully !`)
    }).catch(err => notifyFail(err.message))
  }

  const deleteGateway = gatewayID => {
    GatewayService.delete(gatewayID).then(response => {
      const newList = [...list]
      const idx = newList.findIndex(gateway => gateway.ID === gatewayID)
      newList.splice(idx, 1)
      setList(newList)
      notifySuccess(`Delete successfully !`)
    }).catch(err => notifyFail(err.message))
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

    {currGatewatList.map(gateway =>
      <DropdownItem key={shortId()}
        onEdit={() => {
          setShowModal(true)
          setEditTarget(gateway)
        }}
        onDelete={() => {
          const confirm = window.confirm("Do you want to delete this gateway")
          confirm && deleteGateway(gateway.ID)
          setEditTarget(null)
        }}
      >
        <DropdownItem.Header>
          <div className="row">
            <div className="text-primary col-3"><u>#{gateway.ID}</u></div>
            <div className="fw-bold col-4">{gateway.name}</div>
            <div className="col-5">{gateway.description}</div>
          </div>
        </DropdownItem.Header>
        <DropdownItem.Body>
          <MappingList gatewayID={gateway.ID} />

        </DropdownItem.Body>
      </DropdownItem>)}
  </div>
}

