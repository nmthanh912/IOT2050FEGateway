import DropdownItem from "../dropdownItem"
import { Button } from 'react-bootstrap'
import { useEffect, useState } from "react"
import BootstrapSwitchButton from "bootstrap-switch-button-react"
import MappingList from "./mappingList"


export default function Gateway({ data, onEdit, onDelete, isRunning }) {
  const [disabledToggle, setDisabledToggle] = useState(false)
  const [poweron, setPoweron] = useState(isRunning)

  useEffect(() => {
    setPoweron(isRunning)
  }, [isRunning])

  return <DropdownItem
    onEdit={onEdit}
    onDelete={onDelete}
  >
    <DropdownItem.Header>
      <div className="row">
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
                setDisabledToggle(true)
                setTimeout(() => setDisabledToggle(false), 3000)
                if (!poweron) console.log("POWERON GATEWAY")
                else console.log("SHUTDOWN GATEWAY")
                setPoweron(checked)
              }}
            />
          </Button>
        </div>
      </div>
    </DropdownItem.Header>
    <DropdownItem.Body>
      <MappingList gatewayID={data.ID} name={data.name}/>
    </DropdownItem.Body>
  </DropdownItem>
}