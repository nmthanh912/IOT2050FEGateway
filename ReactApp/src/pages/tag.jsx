// import { Badge } from "react-bootstrap"
import ReactJson from "react-json-view";
import Header from "../components/tag/header";
import Item from "../components/tag/item";
import { Button, Form, Modal } from 'react-bootstrap';
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from 'react'

import { deleteTag, updateTag, fetchTags } from "../redux/slices/tag";

export default function Tag() {
  const status = useSelector(state => state.tag.status)
  const tagList = useSelector(state => state.tag.tags)
  const dispatch = useDispatch()

  useEffect(() => {
    if(status === 'idle') dispatch(fetchTags())
    setTimeout(() => console.log(tagList), 3000)
  }, [dispatch, status])

  const [showEditBox, setShowEditBox] = useState(false)
  const [editTagId, setEditTagId] = useState('')
  const [editTagName, setEditTagName] = useState('')
  const [editTagAttr, setEditTagAttr] = useState({})

  const handleUpdateTag = (id, name, attribute) => {
    dispatch(updateTag({
      id, name, attribute
    }))
  }

  const handleDeleteTag = id => {
    let confirm = window.confirm("Are you sure about that ?")
    confirm && dispatch(deleteTag(id))
  }

  return <div>
    <Header />
    <hr />
    { status === 'succeed' && tagList.map(item => <Item
        key={item.id}
        onDelete={() => handleDeleteTag(item.id)}
        onEdit={() => {
          setShowEditBox(true)
          setEditTagId(item.id)
          setEditTagName(item.name)
          setEditTagAttr(item.attribute)
        }}
      >
        <Item.Header>
          <u className="text-primary me-5">#{item.id}</u>
          <b>{item.name}</b>
        </Item.Header>
        <Item.Body>
          <ReactJson src={item.attribute}
            name={'attributes'}
            iconStyle="circle"
            displayDataTypes={true}
            displayObjectSize={true}
          />
        </Item.Body>
      </Item>
      )
    }
    
    <Modal show={showEditBox} onHide={() => setShowEditBox(false)}>
      <Modal.Header className="bg-dark text-light">
        <h5 className="m-auto">Edit Tag</h5>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>Tag name</Form.Label>
          <Form.Control value={editTagName} onChange={e => setEditTagName(e.target.value)} />
        </Form.Group>
        <ReactJson
          name='attribute'
          src={editTagAttr}
          iconStyle="circle"
          onEdit={edit => setEditTagAttr(edit.updated_src)}
          onDelete={del => setEditTagAttr(del.updated_src)}
          onAdd={add => setEditTagAttr(add.updated_src)}
          displayDataTypes={true}
          displayObjectSize={true}
        />
        <Button
          className="float-end"
          onClick={() => {
            handleUpdateTag(editTagId, editTagName, editTagAttr)
            setShowEditBox(false)
          }}
        >
          Save
        </Button>
      </Modal.Body>
    </Modal>
  </div>
}