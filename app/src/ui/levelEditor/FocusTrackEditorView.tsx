import { useComponent } from "@niloc/ecs-react";
import type { FocusTrackEditor } from "../../components/editor/FocusTrackEditor";
import type { TimeTransform } from "../../components/editor/TimeTransform";
import type { Time } from "../../components/Time";
import { FocusEditor } from "./focus/focusEditor/FocusEditor";
import { TrackEditorContent, TrackEditorHead, TrackEditorView } from "./TrackEditorView";
import type { Focus } from "../../sound/song/Focus";
import { useEffect, useRef, type CSSProperties, type MouseEvent } from "react";
import "./FocusTrackEditorView.scss"
import { MouseButtons } from "../../utils/MouseButtons";
import { TimeMover } from "../../utils/handlers/TimeMover";
import type { Handler } from "../../utils/handlers/Handler";
import { FormInputField } from "../form/FormInputField";

export function FocusTrackEditorView(props: {
    editor: FocusTrackEditor,
    transform: TimeTransform,
    time: Time
}) {
    const { track } = useComponent(props.editor)
    const ref = useRef<HTMLDivElement | null>(null)

    function onDoubleClick(e: MouseEvent) {
        if (!ref.current)
            return

        const ticks = props.transform.getTicksForMouse(e.nativeEvent, ref.current)
        props.editor.addFocusEvent(ticks)
    }

    return <TrackEditorView
        transform={props.transform}
        className="FocusTrackEditorView"
    >
        <TrackEditorHead
            title="Focus track"
        >
            <FormInputField label="Initial focus">
                <FocusEditor
                    value={track.initialFocus}
                    onChange={value => props.editor.setInitialFocus(value)}
                />
            </FormInputField>
        </TrackEditorHead>
        <TrackEditorContent
            time={props.time}
            ref={ref}
            onDoubleClick={onDoubleClick}
        >
            {
                props.editor.track.events.map(event => <FocusEventView
                    key={event.id}
                    editor={props.editor}
                    id={event.id}
                    time={event.time}
                    duration={event.duration}
                    focus={event.focus}
                    transform={props.transform}
                />)
            }
        </TrackEditorContent>

    </TrackEditorView>
}

function FocusEventView(props: {
    editor: FocusTrackEditor,
    id: string,
    time: number,
    focus: Focus,
    duration: number,
    transform: TimeTransform
}) {
    const handler = useRef<Handler | null>(null)

    useEffect(() => {
        return () => {
            handler.current?.destroy()
            handler.current = null
        }
    }, [])

    function onContextMenu(e: MouseEvent) {
        e.preventDefault()
        e.stopPropagation()
        props.editor.remove(props.id)
    }

    function onMouseDown(e: MouseEvent) {
        if (e.buttons === MouseButtons.Left) {
            e.preventDefault()
            e.stopPropagation()

            const mover = new TimeMover({
                event: e.nativeEvent,
                startTicks: props.time,
                transform: props.transform,
                minTicks: 0,
            })

            mover.events.on('change', ticks => props.editor.setTime(props.id, ticks))

            handler.current?.destroy()
            handler.current = mover
        }
    }

    function onLeftMouseDown(e: MouseEvent) {
        if (e.buttons === MouseButtons.Left) {
            e.preventDefault()
            e.stopPropagation()

            const mover = new TimeMover({
                event: e.nativeEvent,
                startTicks: props.time,
                transform: props.transform,
                minTicks: 0,
                maxTicks: props.time + props.duration
            })

            mover.events.on('change', ticks => props.editor.setStartTime(props.id, ticks))

            handler.current?.destroy()
            handler.current = mover
        }
    }

    function onRightMouseDown(e: MouseEvent) {
        if (e.buttons === MouseButtons.Left) {
            e.preventDefault()
            e.stopPropagation()

            const mover = new TimeMover({
                event: e.nativeEvent,
                startTicks: props.time + props.duration,
                transform: props.transform,
                minTicks: props.time
            })

            mover.events.on('change', ticks => props.editor.setDuration(props.id, ticks - props.time))

            handler.current?.destroy()
            handler.current = mover
        }
    }

    return <div
        className="FocusEventView"
        style={{
            "--duration": props.duration,
            "--time": props.time
        } as CSSProperties}
    >
        <div className="tail"
            onContextMenu={onContextMenu}
            onMouseDown={onMouseDown}
        >
            <div className="resizer-left" onMouseDown={onLeftMouseDown}></div>
            <div className="resizer-right" onMouseDown={onRightMouseDown}></div>
        </div>
        <div className="event">
            <FocusEditor
                value={props.focus}
                onChange={value => props.editor.setFocus(props.id, value)}
            />
        </div>
    </div>
}