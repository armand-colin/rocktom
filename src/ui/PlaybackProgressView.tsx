import { useComponent } from "@niloc/ecs-react";
import { useMemo, type CSSProperties, type MouseEvent } from "react";
import type { Playback } from "../components/Playback";
import "./PlaybackProgressView.scss";

export function PlaybackProgressView(props: { playback: Playback }) {
    const { ticks } = useComponent(props.playback.playbackTime)
    const duration = props.playback.level.durationInTicks

    function onClick(e: MouseEvent) {
        const rect = (e.target as HTMLElement).getBoundingClientRect()
        const clickPosition = e.clientX - rect.left
        const clickRatio = clickPosition / rect.width
        const newTicks = clickRatio * duration
        props.playback.seekTicks(newTicks)
    }

    const markers = useMemo(() => {
        const markersElements = []

        for (let i = 0; i < props.playback.level.noteTrack.markers.length; i++) {
            const marker = props.playback.level.noteTrack.markers[i]
            let duration = 0
            if (i < props.playback.level.noteTrack.markers.length - 1) {
                const nextMarker = props.playback.level.noteTrack.markers[i + 1]
                duration = nextMarker.time - marker.time
            } else {
                duration = props.playback.level.durationInTicks - marker.time
            }

            markersElements.push(
                <div
                    key={marker.time}
                    className="marker"
                    style={{
                        "--marker-duration": duration,
                        "--marker-time": marker.time
                    } as CSSProperties}
                >
                    {marker.name}
                </div>
            )
        }

        return markersElements
    }, [props.playback.level.noteTrack.markers])

    return <div
        className="PlaybackProgressView"
        style={{
            '--progress': (ticks / duration),
            '--duration': props.playback.level.durationInTicks
        } as CSSProperties}
        onClick={onClick}
    >
        <div className="bar"></div>
        {markers}
    </div>
}