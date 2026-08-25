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

    return <table className="PlaybackTimeView">
        <tbody>
            <tr>
                <td className="label">Time</td>
                <td className="value">{formatPlaybackTime(time.seconds)}</td>
            </tr>
            <tr>
                <td className="label">Ticks</td>
                <td className="value">{time.ticks}</td>
            </tr>
            <tr>
                <td className="label">Tempo</td>
                <td className="value">{time.tempo.bpm.toFixed(1)} BPM</td>
            </tr>
            <tr>
                <td className="label">Bar</td>
                <td className="value">{bars} : {beatInBar.toFixed(1)}</td>
            </tr>
            <tr>
                <td className="label">Delta</td>
                <td className="value">{(deltaTime * 1000) | 0}ms</td>
            </tr>
        </tbody>
    </table>
}
