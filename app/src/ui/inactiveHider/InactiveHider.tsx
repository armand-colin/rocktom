import { useEffect, useRef, useState } from "react"
import "./InactiveHider.scss"

type Props = {
    children?: React.ReactNode
    timeout?: number,
    enabled?: boolean,
}

enum State {
    Shown = "shown",
    Hiding = "hiding",
    Hidden = "hidden",
}

export function InactiveHider(props: Props) {
    const hideTimeout = useRef<number | null>(null)
    const [state, setState] = useState(State.Shown)

    useEffect(() => {
        if (!props.enabled) {
            if (hideTimeout.current) {
                clearTimeout(hideTimeout.current)
                hideTimeout.current = null
            }
            setState(State.Shown)
            return;
        }

        const update = () => {
            setState(State.Shown);

            if (hideTimeout.current) {
                clearTimeout(hideTimeout.current)
                hideTimeout.current = null
            }

            hideTimeout.current = setTimeout(() => {
                hideTimeout.current = null;
                setState(State.Hiding);

                hideTimeout.current = setTimeout(() => {
                    setState(State.Hidden);
                }, 1000, undefined);
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
        data-state={state}
    >
        {state !== State.Hidden && props.children}
    </div>
}