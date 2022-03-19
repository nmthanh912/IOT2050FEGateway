import DropdownItem from "../components/dropdownItem";
import Modal from '../components/gateway/modal'
import SubHeader from "../components/subHeader";
import MappingList from "../components/gateway/mappingList";
import { useEffect, useState } from "react";
import ShortUniqueId from "short-unique-id";
import GatewayService from "../services/gateway";
import { useSelector, useDispatch } from 'react-redux'
import { Button } from "react-bootstrap";
import { PlusCircle } from "react-bootstrap-icons";

const uid = new ShortUniqueId({ length: 3 })

export default function GatewayPage() {
  const deviceList = useSelector(state => state.device)
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)

  const dispatch = useDispatch()
  const [list, setList] = useState([])

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
      setList([...list, { ID: response.data.ID, ...data }])
    })
  }

  const editGateway = data => {
    GatewayService.update(editTarget.ID, data).then(response => {
      const newList = [...list]
      const edittedGateway = newList.find(gateway => gateway.ID === editTarget.ID)
      Object.assign(edittedGateway, data)
      setList(newList)
    })
  }

  const deleteGateway = gatewayID => {
    GatewayService.delete(gatewayID).then(response => {
      const newList = [...list]
      const idx = newList.findIndex(gateway => gateway.ID === gatewayID)
      newList.splice(idx, 1)
      setList(newList)
    })
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
    />
    <hr />

    {list.map(gateway =>
      <DropdownItem key={uid()}
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

