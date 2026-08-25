import type { ReactNode } from "react"
import { UiSize } from "../UiSize"
import { cn } from "../utils/cn"
import "./Tooltip.scss"

export type TooltipPlacement = "top" | "bottom" | "left" | "right"

type Props = {
    children: ReactNode
    content: ReactNode
    size?: UiSize
    placement?: TooltipPlacement
    disabled?: boolean
    className?: string
}

export function Tooltip(props: Props) {
    return (
        <div
            className={cn("Tooltip", props.className)}
            data-size={props.size ?? UiSize.M}
            data-placement={props.placement ?? "top"}
            data-disabled={props.disabled ?? false}
        >
            <div className="trigger">{props.children}</div>
            <div className="content" role="tooltip">
                <div className="content-inner">{props.content}</div>
            </div>
        </div>
    )
}
