import { Enum } from "@niloc/utils"
import { UiSize } from "../UiSize"
import { cn } from "../utils/cn"
import "./Pill.scss"

export const PillTheme = Enum.create({
    Default: "default",
    Primary: "primary",
    Warning: "warning",
})

export type PillTheme = Enum.Infer<typeof PillTheme>

type Props = {
    label: string,
    theme?: PillTheme,
    className?: string,
    size?: UiSize,
}

export function Pill(props: Props) {
    return <span
        className={cn("Pill", props.className)}
        data-size={props.size ?? UiSize.XSmall}
        data-theme={props.theme ?? PillTheme.Default}
    >
        {props.label}
    </span>
}
