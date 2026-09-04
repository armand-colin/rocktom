import type { CSSProperties, MouseEvent, ReactNode } from "react"
import './Button.scss'
import { UiSize } from "../UiSize"
import { Enum } from "../../utils/Enum"

export const ButtonTheme = Enum.create({
    Default: "default",
    Primary: "primary",
    Danger: "danger",
})

export type ButtonTheme = Enum.Infer<typeof ButtonTheme>

export const ButtonVariant = Enum.create({
    Default: "default",
    Ghost: "ghost",
})

export type ButtonVariant = Enum.Infer<typeof ButtonVariant>

type Props = {
    onClick?: (e: MouseEvent<HTMLElement>) => void
    children: ReactNode,
    disabled?: boolean,
    size?: UiSize,
    theme?: ButtonTheme,
    variant?: ButtonVariant,
    className?: string,
    style?: CSSProperties,
    primitive?: 'button' | 'label',
    htmlFor?: string,
    shape?: 'rectangle' | 'square',
    type?: 'button' | 'submit';
    title?: string;
    onMouseDown?: (e: MouseEvent<HTMLElement>) => void;
}

export function Button(props: Props) {
    const Primitive = props.primitive === 'label' ? 'label' : 'button'
    const shape = props.shape ?? 'rectangle';

    return <Primitive
        className={
            "Button" +
            (props.className ? " " + props.className : "")
        }
        data-size={props.size ?? UiSize.M}
        data-theme={props.theme ?? ButtonTheme.Default}
        data-shape={shape}
        data-variant={props.variant ?? "default"}
        onClick={props.onClick}
        disabled={props.disabled}
        style={props.style}
        htmlFor={props.htmlFor}
        type={props.type ?? "button"}
        title={props.title}
        onMouseDown={props.onMouseDown}
    >
        {props.children}
    </Primitive>
}