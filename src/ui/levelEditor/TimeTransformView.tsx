import { useComponent } from "@niloc/ecs-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { TimeTransform } from "../../components/editor/TimeTransform";
import type { PlaybackTime } from "../../components/PlaybackTime";
import { Tempo } from "../../sound/Tempo";
import "./TimeTransformView.scss";
import { TrackEditorContent, TrackEditorView } from "./TrackEditorView";

export const TimeTransformViewId = "TimeTransformView";


function formatBars(ticks: number): string {
    const bars = Math.trunc(ticks / Tempo.bars(1))
    const beats = Math.trunc((ticks % Tempo.bars(1)) / Tempo.beats(1))
    if (beats > 0) {
        return `${bars}:${beats}`
    } else {
        return `${bars}`
    }
}

export function TimeTransformView(props: { transform: TimeTransform, time: PlaybackTime }) {
    const ref = useRef<HTMLDivElement | null>(null)
    const [width, setWidth] = useState(100)
    const { ratio, offset } = useComponent(props.transform)
    const { ticks } = useComponent(props.time)

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
                className="marker"
                style={{ "--ticks": i } as CSSProperties}
            >
                {formatBars(i)}
            </div>)
            i += step
        }

        return markers
    }, [width, ratio, offset])

    return <TrackEditorView
        className="TimeTransformView"
        time={props.transform}
    >
        <TrackEditorContent
            ref={onRef}
            id={TimeTransformViewId}
        >
            {markers}
            <div
                className="playhead"
                style={{ "--ticks": ticks } as CSSProperties}
            />
        </TrackEditorContent>
    </TrackEditorView>
}