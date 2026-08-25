import { useEffect, useRef, useState, type ReactNode } from "react"
import "./InactiveHider.scss"

export enum InactiveHiderState {
    Shown = "shown",
    Hiding = "hiding",
    Hidden = "hidden",
}

type InactiveHiderFnProps = {
    children: (args: { state: InactiveHiderState }) => ReactNode
    timeout?: number
    enabled?: boolean
}

export function InactiveHiderFn(props: InactiveHiderFnProps) {
    const hideTimeout = useRef<number | null>(null)
    const [state, setState] = useState(InactiveHiderState.Shown)

    useEffect(() => {
        if (!props.enabled) {
            if (hideTimeout.current) {
                clearTimeout(hideTimeout.current)
                hideTimeout.current = null
            }
            setState(InactiveHiderState.Shown)
            return;
        }

        const update = () => {
            setState(InactiveHiderState.Shown);

            if (hideTimeout.current) {
                clearTimeout(hideTimeout.current)
                hideTimeout.current = null
            }

            hideTimeout.current = setTimeout(() => {
                hideTimeout.current = null;
                setState(InactiveHiderState.Hiding);

                hideTimeout.current = setTimeout(() => {
                    setState(InactiveHiderState.Hidden);
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

    return props.children({ state })
}

type Props = {
    children?: ReactNode
    timeout?: number
    enabled?: boolean
    className?: string
}

export function InactiveHider(props: Props) {
    return (
        <InactiveHiderFn enabled={props.enabled} timeout={props.timeout}>
            {({ state }) => (
                <div
                    className={`InactiveHider ${props.className}`}
                    data-state={state}
                >
                    {state !== InactiveHiderState.Hidden && props.children}
                </div>
            )}
        </InactiveHiderFn>
    )
}
