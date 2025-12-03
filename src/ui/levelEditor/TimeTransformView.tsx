import { useComponent } from "@niloc/ecs-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { TimeTransform } from "../../components/editor/TimeTransform";
import type { PlaybackTime } from "../../components/PlaybackTime";
import { Tempo } from "../../sound/Tempo";
import "./TimeTransformView.scss";

export function TimeTransformView(props: { transform: TimeTransform, time: PlaybackTime }) {
    const ref = useRef<HTMLDivElement | null>(null)
    const [width, setWidth] = useState(100)
    const { ratio, offset } = props.transform
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
        const step = Tempo.bars(1)
        const start = offset - (offset % step)
        const end = offset + width / ratio

        let i = start
        while (i < end) {
            markers.push(<div
                className="marker"
                style={{ "--ticks": i } as CSSProperties}
            >
                {(i / step + 1).toFixed(0)}
            </div>)
            i += step
        }

        return markers
    }, [width, ratio, offset])

    return <div
        className="TimeTransformView"
        style={{
            "--ratio": ratio,
            "--offset": offset
        } as CSSProperties}
    >
        <div className="head"></div>
        <div className="markers" ref={onRef}>
            {markers}
            <div
                className="playhead"
                style={{ "--ticks": ticks } as CSSProperties}
            />
        </div>
    </div>
}