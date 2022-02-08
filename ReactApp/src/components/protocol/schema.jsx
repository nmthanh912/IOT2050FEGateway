import { FormSelect } from "react-bootstrap"
import { Pencil, Trash, X } from "react-bootstrap-icons"
import { INT, BLOB, REAL, TEXT } from "./datatypes"
import EditableContent from "../editableContent"
import ShortUniqueId from "short-unique-id";

const uid = new ShortUniqueId({
    length: 4,
    dictionary: 'number'
});

export default function Schema({ schema }) {
    return <div className="mb-2 w-100">
        <div className={`px-3 py-2 mx-1 bg-dark border border-1 rounded-top 
            text-white fw-bold d-flex justify-content-between`}>
            <EditableContent>
                <span className="hover">{schema.sname}</span>
            </EditableContent>
            <div>
                <Pencil className="hover" />
                <Trash className="hover ms-2" />
            </div>
        </div>
        <div className="px-3 py-2 mx-1 bg-white rounded-bottom border border-top-0">
            {schema.columns.map(value => {
                return <ColumnDef def={value} key={uid()} />
            })}
        </div>
    </div>
}

function ColumnDef({ def }) {
    return <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="d-flex">
            <EditableContent>
                <span className="fst-italic hover">{def.colName}</span>
            </EditableContent> {' '}:
        </div>
        <div className="d-flex align-items-center">
            <FormSelect size="sm" style={{ width: '80px' }} disabled>
                <option>{INT}</option>
                <option>{REAL}</option>
                <option>{TEXT}</option>
                <option>{BLOB}</option>
            </FormSelect>
            <X className="hover ms-2" size={18} />
        </div>
    </div>
}