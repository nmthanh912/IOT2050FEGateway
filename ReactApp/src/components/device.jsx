
import DropdownItem from "./dropdownItem";

export default function Device({edit}) {
    return <DropdownItem onEdit={edit} onDuplicate={true} onCreateTemplate>
        <DropdownItem.Header>
            <div className="row">
                <div className="text-primary col-3"><u>#{'12ab56f'}</u></div>
                <div className="fw-bold col-4">Thiết bị PLC</div>
                <div className="col-5">---------------</div>
            </div>
        </DropdownItem.Header>
        <DropdownItem.Body>
            áđâsđâsd
        </DropdownItem.Body>

    </DropdownItem>
}