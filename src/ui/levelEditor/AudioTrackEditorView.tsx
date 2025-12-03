import { useComponent } from "@niloc/ecs-react";
import type { AudioTrackEditor } from "../../components/editor/AudioTrackEditor";
import type { TimeTransform } from "../../components/editor/TimeTransform";
import type { ChangeEvent, CSSProperties } from "react";
import { AudioType } from "../../sound/song/AudioTrack";
import type { TempoTrackEditor } from "../../components/editor/TempoTrackEditor";
import "./AudioTrackEditorView.scss"
import { NumberInput } from "../input/NumberInput";

export function AudioTrackEditorView(props: {
    transform: TimeTransform,
    tempoTrack: TempoTrackEditor,
    editor: AudioTrackEditor
}) {
    const { track } = useComponent(props.editor)
    const { track: tempoTrack } = useComponent(props.tempoTrack)
    const { ratio, offset } = useComponent(props.transform)

    function onTypeChange(e: ChangeEvent<HTMLSelectElement>) {
        const type = parseInt(e.target.value) as AudioType
        props.editor.setType(type)
    }

    const startTicks = tempoTrack.ticksFromSeconds(track.time)
    const endTicks = tempoTrack.ticksFromSeconds(track.time + track.duration)
    const durationTicks = endTicks - startTicks

    return <div
        className="AudioTrackEditorView"
        style={{
            "--ratio": ratio,
            "--offset": offset
        } as CSSProperties}
    >
        <div className="head">
            <select
                onChange={onTypeChange}
                value={track.payload.type}
            >
                <option value={AudioType.None}>None</option>
                <option value={AudioType.Url}>URL</option>
                <option value={AudioType.YouTube}>YouTube</option>
            </select>
            {
                track.payload.type === AudioType.None ?
                    undefined :
                    <TimeEditor 
                        time={track.time}
                        duration={track.duration}
                        onTimeChange={time => props.editor.setTime(time)}
                        onDurationChange={duration => props.editor.setDuration(duration)}
                    />
            }
        </div>
        <div
            className="content"
            style={{
                "--ticks": startTicks,
                "--duration": durationTicks
            } as CSSProperties}
        >
            {
                track.payload.type === AudioType.Url ?
                    <div className="audio"></div>
                    : track.payload.type === AudioType.YouTube ?
                        <div className="audio"></div>
                        : undefined
            }
        </div>
    </div>
}

function TimeEditor(props: {
    time: number,
    duration: number,
    onTimeChange: (time: number) => void,
    onDurationChange: (duration: number) => void
}) {
    return <div className="TimeEditor">
        <NumberInput
            name="time"
            value={props.time}
            onChange={props.onTimeChange}
            step={0.01}
        />
        <NumberInput
            name="duration"
            value={props.duration}
            onChange={props.onDurationChange}
            step={0.01}
        />
    </div>
}