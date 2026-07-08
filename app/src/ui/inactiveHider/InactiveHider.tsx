import { useEffect, useRef, useState } from "react"
import "./InactiveHider.scss"

type Props = {
    children?: React.ReactNode
    timeout?: number,
    enabled?: boolean,
}

export function InactiveHider(props: Props) {
    const hideTimeout = useRef<number | null>(null)
    const [hidden, setHidden] = useState(false)

    useEffect(() => {
        if (!props.enabled) {
            if (hideTimeout.current) {
                clearTimeout(hideTimeout.current)
                hideTimeout.current = null
            }
            setHidden(false)
            return;
        }

        const update = () => {
            setHidden(() => false);

            if (hideTimeout.current) {
                clearTimeout(hideTimeout.current)
                hideTimeout.current = null
            }

            hideTimeout.current = setTimeout(() => {
                hideTimeout.current = null;
                setHidden(true);
            }, props.timeout, undefined)
        }

        window.addEventListener('mousemove', update)
        window.addEventListener('keydown', update)

        update();

        return () => {
            window.removeEventListener('mousemove', update)
            window.removeEventListener('keydown', update)
        }
    }, [props.enabled])

    return <div
        className="InactiveHider"
        data-hidden={hidden}
    >
        {props.children}
    </div>
}