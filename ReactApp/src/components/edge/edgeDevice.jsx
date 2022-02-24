
import DropdownItem from "../dropdownItem";
import TagList from "./tagList";

export default function EdgeDevice({edit}) {
    return <DropdownItem onEdit={edit} onExport onImport onDelete>
        <DropdownItem.Header>
            <div className="row">
                <div className="text-primary col-3"><u>#{'12ab56f'}</u></div>
                <div className="fw-bold col-4">Thiết bị PLC</div>
                <div className="col-5">---------------</div>
            </div>
        </DropdownItem.Header>
        <DropdownItem.Body>
            <TagList />
        </DropdownItem.Body>
    </DropdownItem>
}