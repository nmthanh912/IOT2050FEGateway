// import { Badge } from "react-bootstrap"
import ShortUniqueId from "short-unique-id";
import { useState } from 'react'
import ReactJson from "react-json-view";
import Header from "../components/tag/header";
import Item from "../components/tag/item";

const uid = new ShortUniqueId({
  length: 7,
  dictionary: 'number'
});

export default function Tag() {
  const [list, setList] = useState([{
    id: uid(),
    name: 'Tag đo nhiệt độ',
    attribute: {
      temp: 273
    }
  }, {
    id: uid(),
    name: 'Tag đo nồng độ CO2',
    attribute: {}
  }])

  const updateItemAttr = (id, newItem) => {
    let newList = [...list];
    let item = newList.find(value => value.id === id);
    Object.assign(item.attribute, newItem)
    setList(newList)
    setTimeout(() => console.log(list), 2000)
  }

  const updateItemName = (itemId, newName) => {
    let newList = [...list];
    let item = newList.find(value => value.id === itemId);
    item.name = newName
    setList(newList)
  }

  const removeItem = id => {
    let newList = [...list];
    let i = newList.findIndex(value => value.id === id);
    newList.splice(i, 1)
    setList(newList)
  }

  const addItem = name => {
    setList([...list, {
      id: uid(),
      name: name,
      attribute: {}
    }])
  }

  return <div>
    <Header addItem={addItem} />
    <hr />
    {list.map(item => {
      return <Item key={item.id}
        remove={removeItem}
        editName={updateItemName}
      >
        <Item.Header>
          <u className="text-primary me-5">#{item.id}</u>
          <b>{item.name}</b>
        </Item.Header>
        <Item.Body>
          <ReactJson src={item.attribute}
            name={'attributes'}
            iconStyle="circle"
            onEdit={edit => updateItemAttr(item.id, edit.updated_src)}
            onDelete={del => updateItemAttr(item.id, del.updated_src)}
            onAdd={add => updateItemAttr(item.id, add.updated_src)}
            displayDataTypes={true}
            displayObjectSize={true}
          />
        </Item.Body>
      </Item>
    })}
  </div>
}