import Header from "../components/mqtt/header"
import Client from "../components/mqtt/client"
import { useSelector } from "react-redux"

export default function MQTT() {
    const clients = useSelector(state => state.mqtt.clients)

    return <div>
        <Header />
        <hr />
        <div className="row mx-1 px-1">
            <h6 className="col-3">Username</h6>
            <h6 className="col-3">Password</h6>
            <h6 className="col-3">IP</h6>
            <h6 className="col-1">Port</h6>
            <h6 className="col-2">Action</h6>
        </div>
        {
            clients.map(client => <Client
                key={client.uname}
                uname={client.uname}
                pwd={client.pwd}
                ip={client.IP}
                port={client.port}
            />)
        }

    </div>
}