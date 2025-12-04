import { useComponent } from "@niloc/ecs-react";
import { useState, type CSSProperties, type MouseEvent } from "react";
import type { TempoTrackEditor } from "../../components/editor/TempoTrackEditor";
import type { TimeTransform } from "../../components/editor/TimeTransform";
import { NumberInput } from "../input/NumberInput";
import "./TempoTrackEditorView.scss";

export function TempoTrackEditorView(props: { transform: TimeTransform, editor: TempoTrackEditor }) {
    const { track } = useComponent(props.editor)
    const { offset, ratio } = useComponent(props.transform)

    function onInitialChange(bpm: number) {
        props.editor.setInitial(bpm)
    }

    function onDoubleClick(e: MouseEvent<HTMLDivElement>) {
        const div = e.currentTarget
        const rect = div.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const tickOffset = mouseX / props.transform.ratio
        const ticks = props.transform.magnetize(props.transform.offset + tickOffset)

        props.editor.addEvent(ticks)
    }

    return <div
        className="TempoTrackEditorView"
        style={{
            "--tick-offset": offset,
            "--tick-ratio": ratio
        } as CSSProperties}
    >
        <div className="start">
            <NumberInput
                name="initialBpm"
                value={track.initialTempo.bpm}
                step={1}
                onChange={onInitialChange}
            />
        </div>

        <div
            className="events"
            onDoubleClick={onDoubleClick}
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
        </div>
    </div>
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
        className="event"
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