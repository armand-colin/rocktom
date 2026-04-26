import type { CSSProperties, MouseEvent, ReactNode } from "react"
import './Button.scss'

type Props = {
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void
    children: ReactNode,
    disabled?: boolean,
    className?: string,
    style?: CSSProperties,
}

export function Button(props: Props) {
    return <button
        {...props}
        className={
            "Button" +
            (props.className ? " " + props.className : "")
        }
        onClick={props.onClick}
        disabled={props.disabled}
        style={props.style}
    >
        {props.children}
    </button>
}