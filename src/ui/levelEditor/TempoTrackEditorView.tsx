import { useComponent } from "@niloc/ecs-react";
import type { TempoTrackEditor } from "../../components/editor/TempoTrackEditor";
import type { CSSProperties, MouseEvent } from "react";
import { NumberInput } from "../input/NumberInput";
import "./TempoTrackEditorView.scss"
import type { TimeTransform } from "../../components/editor/TimeTransform";

export function TempoTrackEditorView(props: { transform: TimeTransform, editor: TempoTrackEditor }) {
    const { track } = useComponent(props.editor)
    const { offset, ratio } = useComponent(props.transform)

    function onInitialChange(bpm: number) {
        props.editor.setInitial(bpm)
    }

    function onDoubleClick(e: MouseEvent<HTMLDivElement>) {
        const div = e.currentTarget
        // compute relative mouseX
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
            {track.events.map(event => {
                return <div
                    onDoubleClick={e => e.stopPropagation()}
                    className="event"
                    key={event.id}
                    style={{
                        "--ticks": event.ticks
                    } as CSSProperties}
                >
                    <div className="time">{event.time.toFixed(2)}</div>
                    <div className="marker"></div>
                </div>
            })}
        </div>
    </div>
}