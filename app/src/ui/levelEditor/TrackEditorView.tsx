import { useComponent } from "@niloc/ecs-react";
import { forwardRef, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import type { TimeTransform } from "../../components/editor/TimeTransform";
import type { Time } from "../../components/Time";
import { PlayHead } from "./PlayHead";
import "./TrackEditorView.scss";

export function TrackEditorView(props: {
    children: ReactNode,
    transform: TimeTransform,
    className?: string
}) {
    const className = "TrackEditorView" + (props.className ? ` ${props.className}` : "")
    const { offset, ratio, hardOffset } = useComponent(props.transform)

    return <div
        className={className}
        style={{
            "--offset": offset,
            "--ratio": ratio,
            "--hard-offset": hardOffset,
        } as CSSProperties}
    >
        {props.children}
    </div>
}

export function TrackEditorHead(props: {
    children: ReactNode,
    className?: string,
    noPadding?: boolean,
    title?: string
}) {
    const className = "TrackEditorHead" + (props.className ? ` ${props.className}` : "")

    return <div
        className={className}
        data-no-padding={props.noPadding ? "true" : undefined}
    >
        {
            props.title && <div className="title">{props.title}</div>
        }
        {props.children}
    </div>
}

type ContentProps = {
    children: ReactNode,
    time: Time,
    id?: string,
    className?: string
    onDoubleClick?: (e: MouseEvent) => void,
    onMouseDown?: (e: MouseEvent) => void,
    onClick?: (e: MouseEvent) => void,
}

export const TrackEditorContent = forwardRef<HTMLDivElement, ContentProps>((props, ref) => {
    const { ticks } = useComponent(props.time)
    const className = "TrackEditorContent" + (props.className ? ` ${props.className}` : "")

    return <div
        ref={ref}
        className={className}
        id={props.id}
        onDoubleClick={props.onDoubleClick}
        onMouseDown={props.onMouseDown}
        onClick={props.onClick}
    >
        <PlayHead ticks={ticks} />
        {props.children}
    </div>
})