import type { CSSProperties, MouseEvent, ReactNode } from "react"
import './Button.scss'
import { UiSize } from "../UiSize"

type Props = {
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void
    children: ReactNode,
    disabled?: boolean,
    size?: UiSize,
    className?: string,
    style?: CSSProperties,
}

export function Button(props: Props) {
    return <button
        className={
            "Button" +
            (props.className ? " " + props.className : "")
        }
        data-size={props.size ?? UiSize.M}
        onClick={props.onClick}
        disabled={props.disabled}
        style={props.style}
    >
        {props.children}
    </button>
}