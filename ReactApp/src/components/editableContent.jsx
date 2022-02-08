import React, { useState } from "react"

export default function EditableContent({ setContent, children }) {
    const [editMode, setEditMode] = useState(false)
    const content = children.props.children
    return <div>
        {editMode ?
            <textarea onChange={e => setContent(e.target.value)} 
                value={content} rows={1}
                className='rounded'
                onBlur={() => setEditMode(false)}
                autoFocus
            >
                {content}
            </textarea>
            : React.cloneElement(children, { onClick: () => setEditMode(true) })
        }
    </div>
}