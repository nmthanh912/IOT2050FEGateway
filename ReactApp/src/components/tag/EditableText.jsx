import { useState, useRef, useEffect } from "react";

function useOutsideClick(ref, trigger, callback) {
    useEffect(() => {
        function onClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                if(trigger()) callback(false)
            }
        }

        // Bind the event listener
        document.addEventListener("mousedown", onClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", onClickOutside);
        };
    }, [ref, trigger, callback]);
}

export default function EditableText({ text, setText, blank = true }) {
    const [editMode, setEditMode] = useState(false);
    const wrapperRef = useRef(false)
    const trigger = () => {
        if (!blank && text === '') {
            alert('A key must not be null')
            return false
        }
        return true
    }

    useOutsideClick(wrapperRef, trigger, setEditMode)

    return <div>
        {editMode ? (
            <input
                type="text"
                value={text}
                style={{ width: '150px' }}
                onChange={e => setText(e.target.value)}
                onKeyUp={e => {
                    if (e.key === 'Enter') {
                        if(trigger()) setEditMode(false)
                    }
                }}
                ref={wrapperRef}
                className="focus-input-off"
            />
        ) : (
            <span
                onClick={() => setEditMode(true)}
                className="border border-1 border-secondary rounded p-1"
            >
                {text !== '' ? text : '---'}
            </span>
        )}
    </div>
}