import DropdownItem from "../dropdownItem"
import { Button } from 'react-bootstrap'
import { useEffect, useState } from "react"
import BootstrapSwitchButton from "bootstrap-switch-button-react"
import MappingList from "./mappingList"
import mqttClient from "../../services/gateway"
import { toast } from "react-toastify"


export default function Gateway({ data, onEdit, onDelete, isRunning }) {
  const [disabledToggle, setDisabledToggle] = useState(false)
  const [poweron, setPoweron] = useState(isRunning)
  useEffect(() => {
    setPoweron(isRunning)
  }, [isRunning])

  const turnOnGateway = () => {
    console.log("POWERON")
    mqttClient.poweron(data.ID).then(res => {
      console.log(res.data)
      setPoweron(true)
    }).catch(err => {
      toast.error(err.response.data.msg)
      setPoweron(false)
    })
  }
  const shutdownGateway = () => {
    console.log("SHUTDOWN")
    mqttClient.shutdown(data.ID).then(res => {
      console.log(res.data)
      setPoweron(false)
    }).catch(err => {
      toast.error("Service error !")
      setPoweron(true)
    })
  }

  return <DropdownItem
    onEdit={!poweron ? onEdit : null}
    onDelete={!poweron ? onDelete : null}
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
                if (!poweron) turnOnGateway()
                else shutdownGateway()
                setPoweron(checked)
              }}
            />
          </Button>
        </div>
      </div>
    </DropdownItem.Header>
    <DropdownItem.Body>
      <MappingList gatewayID={data.ID} name={data.name} editable={!poweron} />
    </DropdownItem.Body>
  </DropdownItem>
}