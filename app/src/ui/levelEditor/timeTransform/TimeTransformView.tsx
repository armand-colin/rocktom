import { useComponent } from "@niloc/ecs-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import type { EditorPlayer } from "../../../components/editor/EditorPlayer";
import type { TimeTransform } from "../../../components/editor/TimeTransform";
import type { Time } from "../../../components/Time";
import { TrackEditorContent, TrackEditorView } from "../TrackEditorView";
import "./TimeTransformView.scss";

export const TimeTransformContainerId = "TimeTransformContainer";

export function TimeTransformView(props: {
    transform: TimeTransform,
    time: Time,
    player: EditorPlayer
}) {
    const ref = useRef<HTMLDivElement | null>(null)
    const [width, setWidth] = useState(100)
    const { ratio, offset } = useComponent(props.transform)

    function onRef(el: HTMLDivElement | null) {
        ref.current = el
        setWidth(el?.clientWidth ?? 100)
    }

    useEffect(() => {
        function onResize() {
            setWidth(ref.current?.clientWidth ?? 100)
        }

        window.addEventListener('resize', onResize)

        return () => {
            window.removeEventListener('resize', onResize)
        }
    }, [])

    const markers = useMemo(() => {
        const markers: ReactNode[] = []

        for (const marker of props.transform.getMarkers(width)) {
            markers.push(<div
                key={marker.ticks}
                className="marker"
                style={{ "--ticks": marker.ticks } as CSSProperties}
            >
                {marker.name}
            </div>)
        }

        return markers
    }, [width, ratio, offset])

    function onClick(e: MouseEvent) {
        const div = ref.current
        if (!div)
            return

        const rect = div.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseTicks = mouseX / props.transform.ratio
        const ticks = props.transform.getTicksAt(mouseTicks)
        
        props.player.seekTicks(ticks)
    }

    return <TrackEditorView
        className="TimeTransformView"
        transform={props.transform}
    >
        <TrackEditorContent time={props.time}>
            <div
                className="TimeTransformContainer"
                ref={onRef}
                id={TimeTransformContainerId}
                onClick={onClick}
            >
                {markers}
            </div>
        </TrackEditorContent>
    </TrackEditorView>
}