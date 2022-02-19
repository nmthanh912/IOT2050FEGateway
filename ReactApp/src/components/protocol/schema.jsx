import { FormControl } from "react-bootstrap"
import { Pencil, Trash } from "react-bootstrap-icons"
import ShortUniqueId from "short-unique-id";
import { useState } from "react";
import { dropTable } from "../../redux/slices/protocol";
import { useDispatch } from "react-redux";
import SchemaModal from './SchemaModal'

const uid = new ShortUniqueId({
    length: 4,
    dictionary: 'number'
});

export default function Schema({ schema }) {
    const [showEditBox, setShowEditBox] = useState(false)
    const dispatch = useDispatch();

    return <div className="mb-2 w-100">
        <div className={`px-3 py-2 mx-1 bg-dark border border-1 rounded-top 
            text-white fw-bold d-flex justify-content-between`}>
            <span className="hover">{schema.sname}</span>
            <div>
                <Pencil className="hover" onClick={() => setShowEditBox(true)} />
                <Trash className="hover ms-2" onClick={() => dispatch(dropTable(schema.sname))} />
            </div>
        </div>
        <div className="px-3 py-2 mx-1 bg-white rounded-bottom border border-top-0">
            {schema.columns.map(value => {
                return <ColumnDef def={value} key={uid()} />
            })}
        </div>
        
        <SchemaModal show={showEditBox} setShow={setShowEditBox} edit={schema} />

    </div>
}

function ColumnDef({ def }) {
    return <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="d-flex">
            <span className="fst-italic">
                {def.colName.concat(def.required ? " (required)" : "")}
            </span>:
        </div>
        <FormControl
            size="sm"
            style={{ width: '50px' }}
            disabled
            value={def.type}
            className="text-center"
        />

    </div>
}