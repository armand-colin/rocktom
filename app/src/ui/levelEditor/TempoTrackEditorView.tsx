import { useComponent } from "@niloc/ecs-react";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import type { TempoTrackEditor } from "../../components/editor/TempoTrackEditor";
import type { TimeTransform } from "../../components/editor/TimeTransform";
import type { Time } from "../../components/Time";
import { NumberInput } from "../input/NumberInput";
import "./TempoTrackEditorView.scss";
import { TrackEditorContent, TrackEditorHead, TrackEditorView } from "./TrackEditorView";
import { Slider } from "../../utils/Slider";
import type { TempoEvent } from "../../sound/song/TempoTrack";
import type { Handler } from "../../utils/handlers/Handler";

export function TempoTrackEditorView(props: { transform: TimeTransform, editor: TempoTrackEditor, time: Time }) {
    const { track } = useComponent(props.editor)

    function onInitialChange(bpm: number) {
        props.editor.setInitial(bpm)
    }

    function onDoubleClick(e: MouseEvent) {
        const div = e.currentTarget
        const rect = div.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const tickOffset = mouseX / props.transform.ratio
        const ticks = props.transform.magnetize(tickOffset - props.transform.offset)
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
                track.events.map((event, i) => <EventView
                    key={event.id}
                    id={event.id}
                    ticks={event.ticks}
                    time={event.time}
                    bpm={event.tempo.bpm}
                    nextEvent={track.events[i + 1] ?? null}
                    previousEvent={track.events[i - 1] ?? null}
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
    bpm: number,
    previousEvent: TempoEvent | null,
    nextEvent: TempoEvent | null,
    onTimeChange: (time: number) => void,
    onRemove: () => void
}) {
    const [changingTime, setChangingTime] = useState(false)
    const handler = useRef<Handler | null>(null)

    useEffect(() => {
        return () => {
            handler.current?.destroy()
            handler.current = null
        }
    }, [])

    function onStartChangingTime(e: MouseEvent<HTMLDivElement>) {
        e.stopPropagation()
        setChangingTime(true)
    }

    function onRemove(e: MouseEvent<HTMLDivElement>) {
        e.preventDefault()
        e.stopPropagation()
        props.onRemove()
    }

    function onMouseDown(e: MouseEvent<HTMLDivElement>) {
        e.stopPropagation()

        handler.current?.destroy()

        const slider = new Slider({
            value: props.time,
            step: 0.005,
            event: e.nativeEvent,
            min: props.previousEvent ? props.previousEvent.time + 0.01 : 0,
            max: props.nextEvent ? props.nextEvent.time - 0.01 : Infinity,
            sensibility: 0.001
        })

        slider.on('change', time => {
            props.onTimeChange(time)
        })

        handler.current = slider
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
            onMouseDown={onMouseDown}
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
        <div className="hint">{props.bpm.toFixed(2)} BPM</div>
        <div className="marker"></div>
    </div>
}