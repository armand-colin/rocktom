import { useComponent } from "@niloc/ecs-react";
import { useEffect, useRef, type CSSProperties, type MouseEvent } from "react";
import type { TempoTrackEditor } from "../../components/editor/TempoTrackEditor";
import type { TimeTransform } from "../../components/editor/TimeTransform";
import type { Time } from "../../components/Time";
import { NumberInput } from "../input/NumberInput";
import "./TempoTrackEditorView.scss";
import { TrackEditorContent, TrackEditorHead, TrackEditorView } from "./TrackEditorView";
import type { TempoEvent } from "../../sound/song/TempoTrack";
import type { Handler } from "../../utils/handlers/Handler";
import { FormInputField } from "../form/FormInputField";
import { UiSize } from "../UiSize";

export function TempoTrackEditorView(props: { transform: TimeTransform, editor: TempoTrackEditor, time: Time }) {
    const { track } = useComponent(props.editor)

    function onInitialChange(bpm: number) {
        props.editor.setInitial(bpm)
    }

    function onLastEventBpmChange(bpm: number) {
        props.editor.setLastEventBpm(bpm)
    }

    const lastEvent = track.events.at(-1)

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
        <TrackEditorHead
            title="Tempo track"
        >
            <div className="grid grid-cols-2 gap-3 w-full">
                <FormInputField label="Initial BPM">
                    <NumberInput
                        name="initialBpm"
                        value={track.initialTempo.bpm}
                        step={1}
                        onChange={onInitialChange}
                        size={UiSize.S}
                    />
                </FormInputField>

                <FormInputField label="Last event BPM">
                    <NumberInput
                        name="lastEventBpm"
                        value={lastEvent?.tempo.bpm ?? null}
                        disabled={!lastEvent}
                        step={1}
                        onChange={onLastEventBpmChange}
                        size={UiSize.S}
                    />
                </FormInputField>
            </div>

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
    const handler = useRef<Handler | null>(null)

    useEffect(() => {
        return () => {
            handler.current?.destroy()
            handler.current = null
        }
    }, [])

    function onContextualMenu(e: MouseEvent) {
        e.stopPropagation()
        e.preventDefault()
        props.onRemove()
    }

    return <div
        onDoubleClick={e => e.stopPropagation()}
        className="EventView"
        style={{
            "--ticks": props.ticks
        } as CSSProperties}
        draggable={false}
        onContextMenu={onContextualMenu}
    >
        <NumberInput
            name="time"
            className="time"
            onChange={time => props.onTimeChange(time)}
            value={props.time}
            step={0.01}
            size={UiSize.XS}
        />
        <div className="hint" draggable={false}>{props.bpm.toFixed(2)} BPM</div>
        <div className="marker" draggable={false}></div>
    </div>
}