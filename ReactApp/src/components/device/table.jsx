import { Card, Badge, Modal, Button, Form } from "react-bootstrap"
import { Trash, Pencil } from "react-bootstrap-icons"
import { useState } from 'react'
import styled from "styled-components";

const DeviceItem = styled(Card)`
  padding: 0;
`;
DeviceItem.Body = styled(Card.Body)`
  padding: .5rem;
`;
const Title = styled.div`
  padding: 0 .5rem;
  font-weight: 600;
`;
const ActionBtn = styled(Badge)`
  cursor: pointer;
`

export default function Table({ list, setList }) {
  const [show, setShow] = useState(false); // Show Modal
  const [modalData, setModalData] = useState({
    id: '',
    name: '',
    description: ''
  })

  const openModal = item => {
    setShow(true)
    setModalData({
      id: item.id,
      name: item.name,
      description: item.description
    })
  }

  const editItem = () => {
    if(modalData.name === '') {
      alert("Device name cannot be blank")
      return
    }
    let newList = [...list]
    let edittingItem = newList.find(item => item.id === modalData.id)
    edittingItem.name = modalData.name
    edittingItem.description = modalData.description
    setList(newList)
    setShow(false)
  }

  const deleteItem = item => {
    if(item.status === "Configured") {
      let ok = window.confirm("Deleting a configured device leads to delete all config of it. Continue ?")
      if(!ok) return;
    }
    const newList = [...list]
    let idx = newList.findIndex(value => value.id === item.id)
    newList.splice(idx, 1)
    setList(newList)
  }

  return <div>
    <Title className="mb-1">
      <div className="row">
        <div className="col-2">
          ID
        </div>
        <div className="col-2">
          Device Name
        </div>
        <div className="col-4">
          Description
        </div>
        <div className="col-3">
          Status
        </div>
        <div className="col-1">
          <span className="float-end">Action</span>
        </div>
      </div>
    </Title>
    {list.map(item => {
      return <DeviceItem className="mb-2" key={item.id}>
        <DeviceItem.Body>
          <div className="row">
            <div className="col-2 text-primary">
              <u>#{item.id}</u>
            </div>
            <div className="col-2">
              {item.name}
            </div>
            <div className="col-4">
              {item.description.length !== 0 ? item.description : '------'}
            </div>
            <div className="col-3 d-flex align-items-center">
              <Badge bg={item.status === "Configured" ? 'success' : 'secondary'}>
                {item.status}
              </Badge>
            </div>
            <div className="col-1 d-flex align-items-center justify-content-end">
              <ActionBtn bg="danger">
                <Trash size={16} onClick={() => deleteItem(item)}/>
              </ActionBtn>
              <ActionBtn bg="info" className="ms-2">
                <Pencil size={16} onClick={() => openModal(item)} />
              </ActionBtn>
            </div>
          </div>
        </DeviceItem.Body>
      </DeviceItem>
    })}

    <Modal show={show} onHide={() => setShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title><u className="text-primary">#{modalData.id}</u></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>Tên thiết bị</Form.Label>
          <Form.Control
            value={modalData.name}
            onChange={e => setModalData({ ...modalData, name: e.target.value })}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Mô tả</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={modalData.description}
            onChange={e => setModalData({ ...modalData, description: e.target.value })}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button variant="light" onClick={() => setShow(false)}>
          Close
        </Button>
        <Button variant="primary" onClick={editItem}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  </div>
}