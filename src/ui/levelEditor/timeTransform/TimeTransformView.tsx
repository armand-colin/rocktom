import { useComponent } from "@niloc/ecs-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { lerp } from "three/src/math/MathUtils.js";
import type { EditorPlayer } from "../../../components/editor/EditorPlayer";
import type { TimeTransform } from "../../../components/editor/TimeTransform";
import type { Time } from "../../../components/Time";
import { Tempo } from "../../../sound/Tempo";
import { TrackEditorContent, TrackEditorView } from "../TrackEditorView";
import "./TimeTransformView.scss";

export const TimeTransformContainerId = "TimeTransformContainer";


function formatBars(ticks: number): string {
    const bars = Math.trunc(ticks / Tempo.bars(1))
    const beats = Math.trunc((ticks % Tempo.bars(1)) / Tempo.beats(1))
    if (beats > 0) {
        return `${bars}:${beats}`
    } else {
        return `${bars}`
    }
}

export function TimeTransformView(props: {
    transform: TimeTransform,
    time: Time,
    player: EditorPlayer
}) {
    const ref = useRef<HTMLDivElement | null>(null)
    const [width, setWidth] = useState(100)
    const { ratio, offset, hardOffset } = useComponent(props.transform)

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
        let step = Tempo.bars(1)

        while (step * ratio > 400) {
            step /= 2
        }

        while (step * ratio < 150) {
            step *= 2
        }

        let { start, end } = props.transform.getBounds(width)
        start = start - (start % step)
        end = end + (step - (end % step))

        let i = start
        while (i < end) {
            markers.push(<div
                key={i}
                className="marker"
                style={{ "--ticks": i } as CSSProperties}
            >
                {formatBars(i)}
            </div>)
            i += step
        }

        return markers
    }, [width, ratio, offset])

    function onClick(e: MouseEvent) {
        const div = ref.current
        if (!div)
            return

        const rect = div.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseT = mouseX / rect.width
        const { start, end } = props.transform.getBounds(rect.width)
        let targetTicks = lerp(start, end, mouseT)
        targetTicks = props.transform.magnetize(targetTicks)
        targetTicks = targetTicks + hardOffset

        props.player.seekTicks(targetTicks)
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