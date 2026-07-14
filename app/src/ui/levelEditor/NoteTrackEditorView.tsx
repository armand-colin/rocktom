import { EngineContext, useComponent } from "@niloc/ecs-react";
import { useContext, useEffect, useRef, type CSSProperties, type MouseEvent } from "react";
import type { NoteTrackEditor } from "../../components/editor/NoteTrackEditor";
import type { TimeTransform } from "../../components/editor/TimeTransform";
import type { Time } from "../../components/Time";
import type { Pattern, TimedPattern } from "../../sound/song/Pattern";
import type { Handler } from "../../utils/handlers/Handler";
import { TimeMover } from "../../utils/handlers/TimeMover";
import { TimeResizer } from "../../utils/handlers/TimeResizer";
import { MouseButtons } from "../../utils/MouseButtons";
import { Button } from "../button/Button";
import { Select } from "../select/Select";
import "./NoteTrackEditorView.scss";
import { TrackEditorContent, TrackEditorHead, TrackEditorView } from "./TrackEditorView";
import { Icon } from "../icon/Icon";
import { ContextualMenu } from "../../resources/contextualMenu/ContextualMenu";
import { ContextualMenuItem } from "../../resources/contextualMenu/ContextualMenuItem";

export function NoteTrackEditorView(props: {
    editor: NoteTrackEditor,
    transform: TimeTransform,
    time: Time,
    onEdit: (pattern: TimedPattern) => void
}) {
    const { track, pattern, patterns } = useComponent(props.editor)
    const ref = useRef<HTMLDivElement | null>(null)

    function onSelectPattern(patternId: string) {
        const selectedPattern = patterns.find(p => p.id === patternId)
        if (selectedPattern)
            props.editor.setPattern(selectedPattern)
    }

    function onMouseDown(e: MouseEvent) {
        e.preventDefault()
        e.stopPropagation()

        if (!ref.current || e.buttons !== MouseButtons.Left)
            return

        const rect = ref.current.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const tickOffset = mouseX / props.transform.ratio
        const ticks = props.transform.magnetize(tickOffset - props.transform.offset)
        props.editor.addTimedPattern(ticks)
    }

    return <TrackEditorView
        className="NoteTrackEditorView"
        transform={props.transform}
    >
        <TrackEditorHead>
            {track.instrument.name}
            <Select
                value={pattern?.id ?? ""}
                onChange={onSelectPattern}
                options={patterns.map(pattern => ({
                    label: pattern.name,
                    value: pattern.id
                }))}
                placeholder="No Pattern created"
            />
            <Button onClick={() => props.editor.createPattern()}>Create pattern</Button>
        </TrackEditorHead>
        <TrackEditorContent
            time={props.time}
            ref={ref}
            onMouseDown={onMouseDown}
        >
            {track.timedPatterns.map((pattern) => <TimedPatternView
                key={pattern.id}
                id={pattern.id}
                pattern={pattern.pattern}
                time={pattern.time}
                duration={pattern.duration}
                onEdit={() => props.onEdit(pattern)}
                editor={props.editor}
                transform={props.transform}
            />)}
        </TrackEditorContent>
    </TrackEditorView>
}

function TimedPatternView(props: {
    pattern: Pattern,
    time: number,
    id: string,
    duration: number,
    onEdit: () => void,
    editor: NoteTrackEditor,
    transform: TimeTransform
}) {
    const handler = useRef<Handler | null>(null)
    const { engine } = useContext(EngineContext)

    const minFret = props.pattern.notes.reduce((min, note) => {
        if (note.fret < min)
            return note.fret
        return min
    }, Infinity)

    const maxFret = props.pattern.notes.reduce((max, note) => {
        if (note.fret > max)
            return note.fret
        return max
    }, minFret)

    function onMouseEnter(e: MouseEvent) {
        if (e.buttons & MouseButtons.Right) {
            e.preventDefault()
            props.editor.removeTimedPattern(props.id)
        }
    }

    function onContextMenu(e: MouseEvent) {
        e.preventDefault()
        props.editor.removeTimedPattern(props.id)
    }

    function onResize(e: MouseEvent) {
        e.stopPropagation()
        e.preventDefault()

        if (e.buttons === MouseButtons.Left) {
            handler.current?.destroy()

            const resizer = new TimeResizer({
                event: e.nativeEvent,
                duration: props.duration,
                transform: props.transform
            })
            resizer.events.on("changed", (duration: number) => {
                props.editor.setTimedPatternDuration(props.id, duration)
            })
            handler.current = resizer
        }
    }

    function onMove(e: MouseEvent) {
        e.stopPropagation()
        e.preventDefault()

        if (e.buttons === MouseButtons.Left) {
            handler.current?.destroy()

            const mover = new TimeMover({
                event: e.nativeEvent,
                startTicks: props.time,
                transform: props.transform,
                minTicks: 0
            })

            mover.events.on("change", (ticks: number) => {
                props.editor.setTimedPatternTime(props.id, ticks)
            })
            handler.current = mover
        }
    }

    function onContextualClick(e: MouseEvent) {
        const contextualMenu = engine.getResource(ContextualMenu)
        contextualMenu.open(e.nativeEvent, [
            ContextualMenuItem.action({
                label: "Edit Pattern",
                icon: "edit",
                action: () => {
                    props.onEdit()
                },
            }),
            ContextualMenuItem.action({
                label: "Delete Pattern",
                icon: "delete",
                theme: "danger",
                action: () => {
                    props.editor.removeTimedPattern(props.id)
                },
            })
        ])
    }

    useEffect(() => {
        return () => {
            handler.current?.destroy()
            handler.current = null
        }
    }, [])

    return <div
        className="TimedPatternView"
        style={{
            "--ticks": props.time,
            "--duration": props.duration,
            "--min-fret": minFret,
            "--max-fret": maxFret,
            "--fret-amplitude": maxFret - minFret + 1
        } as CSSProperties}
        onDoubleClick={props.onEdit}
        onMouseEnter={onMouseEnter}
        onContextMenu={onContextMenu}
        onMouseDown={onMove}
    >
        <div className="head">
            <p>
                {props.pattern.name}
            </p>

            <Button variant="ghost" onClick={onContextualClick}>
                <Icon name="more_vert" />
            </Button>
        </div>
        <div className="notes">
            {props.pattern.notes.map(note => <div
                key={note.id}
                className="note"
                style={{
                    "--note-ticks": note.time,
                    "--note-duration": note.duration,
                    "--note-fret": note.fret,
                    "--contrast": "#" + note.string.outlineColor.getHexString(),
                    "--color": "#" + note.string.color.getHexString()
                } as CSSProperties}
            />)}
        </div>
        <div className="resizer" onMouseDown={onResize} />
    </div>
}