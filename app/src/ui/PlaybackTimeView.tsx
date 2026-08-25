import { useComponent } from "@niloc/ecs-react";
import type { Time } from "../components/Time";
import type { DeltaTime } from "../components/DeltaTime";
import { Tempo } from "../sound/Tempo";
import "./PlaybackTimeView.scss";

function formatPlaybackTime(seconds: number): string {
    const minutes = (seconds / 60) | 0
    const wholeSeconds = (seconds % 60) | 0
    const centiseconds = ((seconds * 100) % 100) | 0

    return `${minutes.toString().padStart(2, '0')}:${wholeSeconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`
}

export function PlaybackTimeView(props: { time: Time, deltaTime: DeltaTime }) {
    const time = useComponent(props.time)
    const { deltaTime } = useComponent(props.deltaTime)

    const bars = (time.ticks / Tempo.bars(1)) | 0
    const beatInBar = (time.ticks % Tempo.bars(1)) / Tempo.PPQ

    return <div className="PlaybackTimeView">
        <div className="field">
            <span className="label">Time</span>
            <span className="value">{formatPlaybackTime(time.seconds)}</span>
        </div>
        <div className="field">
            <span className="label">Ticks</span>
            <span className="value">{time.ticks}</span>
        </div>
        <div className="field">
            <span className="label">Tempo</span>
            <span className="value">{time.tempo.bpm.toFixed(1)} BPM</span>
        </div>
        <div className="field">
            <span className="label">Bar</span>
            <span className="value">{bars} : {beatInBar.toFixed(1)}</span>
        </div>
        <div className="field">
            <span className="label">Delta</span>
            <span className="value">{(deltaTime * 1000) | 0}ms</span>
        </div>
    </div>
}
