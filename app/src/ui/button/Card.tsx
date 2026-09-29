import type { ReactNode } from "react"
import { cn } from "../utils/cn"
import "./Card.scss"

interface Props {
    fixtures?: ReactNode
    children?: ReactNode
    containerClassName?: string
    className?: string
    onClick?: (e: React.MouseEvent<HTMLElement>) => void
    onContextMenu?: (e: React.MouseEvent<HTMLElement>) => void
    primitive?: 'div' | 'li'
}

export function Card(props: Props) {
    const Primitive = props.primitive ?? 'div'

    return <Primitive
        className={cn("Card", props.className)}
    >
        <div
            className={cn("CardContent", props.containerClassName)}
            data-clickable={props.onClick ? "true" : "false"}
            onClick={props.onClick}
            onContextMenu={props.onContextMenu}
        >
            {props.children}
        </div>
        {props.fixtures}
    </Primitive>
}