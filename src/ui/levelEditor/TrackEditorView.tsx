import { forwardRef, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import "./TrackEditorView.scss"
import type { TimeTransform } from "../../components/editor/TimeTransform";
import { useComponent } from "@niloc/ecs-react";
import { PlayHead } from "./PlayHead";
import type { PlaybackTime } from "../../components/PlaybackTime";

export function TrackEditorView(props: {
    children: ReactNode,
    transform: TimeTransform,
    className?: string
}) {
    const className = "TrackEditorView" + (props.className ? ` ${props.className}` : "")
    const { offset, ratio } = useComponent(props.transform)

    return <div
        className={className}
        style={{
            "--offset": offset,
            "--ratio": ratio
        } as CSSProperties}
    >
        {props.children}
    </div>
}

export function TrackEditorHead(props: { children: ReactNode }) {
    return <div className="TrackEditorHead">
        {props.children}
    </div>
}

type ContentProps = {
    children: ReactNode,
    time: PlaybackTime,
    id?: string,
    onDoubleClick?: (e: MouseEvent) => void
}

export const TrackEditorContent = forwardRef<HTMLDivElement, ContentProps>((props, ref) => {
    const { ticks } = useComponent(props.time)
    return <div
        ref={ref}
        className="TrackEditorContent"
        id={props.id}
        onDoubleClick={props.onDoubleClick}
    >
        <PlayHead ticks={ticks} />
        {props.children}
    </div>
})