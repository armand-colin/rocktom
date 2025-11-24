import { useComponent } from "@niloc/ecs-react";
import type { Playback } from "../components/Playback";
import type { CSSProperties, MouseEvent } from "react";
import "./PlaybackProgressView.scss"

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
    return <div 
        className="PlaybackProgressView"
        style={{
            '--progress': (ticks / duration)
        } as CSSProperties}
        onClick={onClick}
    >
        <div className="bar"></div>
    </div>
}