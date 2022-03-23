import { CheckCircleFill, XCircleFill } from "react-bootstrap-icons"
export function SuccessMessage({ msg }) {
    return <div className="d-flex align-items-center">
        <CheckCircleFill size={20} className="me-3 text-success" />
        {msg}
    </div>
}

export function FailMessage({ msg }) {
    return <div className="d-flex align-items-center">
        <XCircleFill size={20} className="me-3 text-danger" />
        {msg}
    </div>
}