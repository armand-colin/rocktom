import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export function FormButtons(props: {
    children?: ReactNode,
    className?: string
}) {
    return <div className={cn("w-full flex gap-2 justify-end", props.className)}>
        {props.children}
    </div>
}