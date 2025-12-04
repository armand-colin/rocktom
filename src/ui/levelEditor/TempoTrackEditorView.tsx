import { useComponent } from "@niloc/ecs-react";
import { useState, type CSSProperties, type MouseEvent } from "react";
import type { TempoTrackEditor } from "../../components/editor/TempoTrackEditor";
import type { TimeTransform } from "../../components/editor/TimeTransform";
import { NumberInput } from "../input/NumberInput";
import "./TempoTrackEditorView.scss";
import { TrackEditorContent, TrackEditorHead, TrackEditorView } from "./TrackEditorView";
import type { PlaybackTime } from "../../components/PlaybackTime";

export function TempoTrackEditorView(props: { transform: TimeTransform, editor: TempoTrackEditor, time: PlaybackTime }) {
    const { track } = useComponent(props.editor)

    function onInitialChange(bpm: number) {
        props.editor.setInitial(bpm)
    }

    function onDoubleClick(e: MouseEvent) {
        const div = e.currentTarget
        const rect = div.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const tickOffset = mouseX / props.transform.ratio
        const ticks = props.transform.magnetize(props.transform.offset + tickOffset)

        props.editor.addEvent(ticks)
    }

    return <TrackEditorView
        className="TempoTrackEditorView"
        transform={props.transform}
    >
        <TrackEditorHead>
            <NumberInput
                name="initialBpm"
                value={track.initialTempo.bpm}
                step={1}
                onChange={onInitialChange}
            />
        </TrackEditorHead>

        <TrackEditorContent
            onDoubleClick={onDoubleClick}
            time={props.time}
        >
            {
                track.events.map(event => <EventView
                    key={event.id}
                    id={event.id}
                    ticks={event.ticks}
                    time={event.time}
                    onTimeChange={time => {
                        props.editor.setEventTime(event.id, time)
                    }}
                    onRemove={() => props.editor.removeEvent(event.id)}
                />)
            }
        </TrackEditorContent>
    </TrackEditorView>
}

function EventView(props: {
    id: string,
    ticks: number,
    time: number,
    onTimeChange: (time: number) => void,
    onRemove: () => void
}) {
    const [changingTime, setChangingTime] = useState(false)

    function onStartChangingTime(e: MouseEvent<HTMLDivElement>) {
        e.stopPropagation()
        setChangingTime(true)
    }

    function onRemove(e: MouseEvent<HTMLDivElement>) {
        e.preventDefault()
        e.stopPropagation()
        props.onRemove()
    }

    return <div
        onDoubleClick={e => e.stopPropagation()}
        className="EventView"
        style={{
            "--ticks": props.ticks
        } as CSSProperties}
    >
        <div
            className="time"
            onDoubleClick={onStartChangingTime}
            onContextMenu={onRemove}
        >
            {
                changingTime ?
                    <NumberInput
                        name="time"
                        onChange={time => props.onTimeChange(time)}
                        value={props.time}
                        step={0.01}
                        autoFocus={true}
                        onBlur={() => setChangingTime(false)}
                    /> :
                    <span>{props.time.toFixed(2)}</span>
            }
        </div>
        <div className="marker"></div>
    </div>
}