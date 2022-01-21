import { InputGroup, FormControl, Button } from "react-bootstrap"
import { NodePlus } from 'react-bootstrap-icons'
import { useState } from "react"
import ShortUniqueId from "short-unique-id";

const uid = new ShortUniqueId({length: 7});

export default function Header({ list, setList }) {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('')
    const addDevice = () => {
        if(name === '') {
            alert("Please type a name")
            return;
        }
        const newList = [...list]
        newList.push({
            id: uid(),
            name: name,
            description: desc,
            status: "Unconfigured"
        })
        setName('')
        setDesc('')
        setList(newList)
    }
    return <div className='row'>
        <div className="col-4">
            <InputGroup>
                <InputGroup.Text>Name</InputGroup.Text>
                <FormControl
                    type="text"
                    placeholder="Name (required)"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
            </InputGroup>
        </div>
        <div className="col-7">
            <InputGroup>
                <InputGroup.Text>Description</InputGroup.Text>
                <FormControl
                    type="text"
                    placeholder="Description (optional)"
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                />
            </InputGroup>
        </div>
        <div className="col-1">
            <Button 
                className="d-flex align-items-center float-end"
                onClick={addDevice}
            >
                <NodePlus size={25} fontWeight={600} />
            </Button>
        </div>
    </div>
}