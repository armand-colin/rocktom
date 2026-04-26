import { useEffect, useRef } from "react"

export function ElementRenderer(props: { element: HTMLElement }) {
    const ref = useRef<HTMLDivElement | null>(null)

    function onRef(div: HTMLDivElement | null) {
        if (div) {
            div.innerHTML = ""
            div.appendChild(props.element)
        }
        ref.current = div
    }

    useEffect(() => {
        if (ref.current) {
            ref.current.innerHTML = ""
            ref.current.appendChild(props.element)
        }
    }, [props.element])
    
    return <div className="ElementRenderer" ref={onRef}>

    </div>
}