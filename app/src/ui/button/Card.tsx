import type { ReactNode } from "react"
import { cn } from "../utils/cn"
import "./Card.scss"
import { useResource } from "@niloc/ecs-react"
import { Haptics } from "../../resources/Haptics"

interface Props {
    fixtures?: ReactNode
    children?: ReactNode
    containerClassName?: string
    className?: string
    onClick?: (e: React.MouseEvent<HTMLElement>) => void
    onContextMenu?: (e: React.MouseEvent<HTMLElement>) => void
    primitive?: 'div' | 'li'
    elevation?: 1 | 2 | 3
}

export function Card(props: Props) {
    const Primitive = props.primitive ?? 'div'
    const haptics = useResource(Haptics)

    function onClick(e: React.MouseEvent<HTMLElement>) {
        if (props.onClick) {
            props.onClick(e)
            haptics.click()
        }
    }

    return <Primitive
        className={cn("Card", props.className)}
        data-elevation={props.elevation ?? 1}
    >
        <div
            className={cn("CardContent", props.containerClassName)}
            data-clickable={props.onClick ? "true" : "false"}
            onClick={onClick}
            onContextMenu={props.onContextMenu}
        >
            {props.children}
        </div>
        {props.fixtures}
    </Primitive>
}