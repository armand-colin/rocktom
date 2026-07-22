import { EngineContext, useComponent } from "@niloc/ecs-react";
import { useContext, useEffect, useRef, type CSSProperties, type MouseEvent } from "react";
import type { NoteTrackEditor } from "../../components/editor/NoteTrackEditor";
import type { TimeTransform } from "../../components/editor/TimeTransform";
import type { Time } from "../../components/Time";
import { ContextualMenu } from "../../resources/contextualMenu/ContextualMenu";
import { ContextualMenuItem } from "../../resources/contextualMenu/ContextualMenuItem";
import type { Handler } from "../../utils/handlers/Handler";
import { TimeMover } from "../../utils/handlers/TimeMover";
import { MouseButtons } from "../../utils/MouseButtons";
import { EditableText } from "../editableText/EditableText";
import { Icon } from "../icon/Icon";
import "./MarkerEditorView.scss";
import { TrackEditorContent, TrackEditorHead, TrackEditorView } from "./TrackEditorView";

export function MarkerEditorView(props: {
    editor: NoteTrackEditor,
    transform: TimeTransform,
    time: Time
}) {
    const { track } = useComponent(props.editor)
    const ref = useRef<HTMLDivElement | null>(null)

    function onDoubleClick(e: MouseEvent) {
        if (!ref.current)
            return

        const ticks = props.transform.getTicksForMouse(e.nativeEvent, ref.current)
        props.editor.addMarker(ticks)
    }

    return <TrackEditorView
        className="MarkerEditorView"
        transform={props.transform}
    >
        <TrackEditorHead
            title="Marker track"
        />
        <TrackEditorContent
            time={props.time}
            ref={ref}
            onDoubleClick={onDoubleClick}
        >
            {track.markers.map((marker, i) => <MarkerView
                key={marker.id}
                id={marker.id}
                name={marker.name}
                time={marker.time}
                nextTime={track.markers[i + 1]?.time ?? null}
                editor={props.editor}
                transform={props.transform}
            />)}
        </TrackEditorContent>
    </TrackEditorView>
}

function MarkerView(props: {
    id: string,
    name: string,
    time: number,
    nextTime: number | null,
    editor: NoteTrackEditor,
    transform: TimeTransform
}) {
    const handler = useRef<Handler | null>(null)
    const { engine } = useContext(EngineContext)

    useEffect(() => {
        return () => {
            handler.current?.destroy()
            handler.current = null
        }
    }, [])

    function onMouseDown(e: MouseEvent) {
        if (e.buttons !== MouseButtons.Left)
            return

        e.stopPropagation()
        e.preventDefault()

        handler.current?.destroy()

        const markers = props.editor.track.markers
        const index = markers.findIndex(marker => marker.id === props.id)
        const prevMarker = index > 0 ? markers[index - 1] : null
        const nextMarker = index < markers.length - 1 ? markers[index + 1] : null

        const mover = new TimeMover({
            event: e.nativeEvent,
            startTicks: props.time,
            transform: props.transform,
            minTicks: prevMarker ? prevMarker.time + 0.01 : 0,
            maxTicks: nextMarker ? nextMarker.time - 0.01 : Infinity
        })

        mover.events.on("change", ticks => {
            props.editor.setMarkerTime(props.id, ticks)
        })

        handler.current = mover
    }

    function onContextMenu(e: MouseEvent) {
        e.preventDefault()
        e.stopPropagation()
        props.editor.removeMarker(props.id)
    }

    function onContextualClick(e: MouseEvent) {
        e.stopPropagation()
        const contextualMenu = engine.getResource(ContextualMenu)
        contextualMenu.open(e.nativeEvent, [
            ContextualMenuItem.action({
                label: "Delete Marker",
                icon: "shift",
                action: () => {
                    props.editor.removeMarker(props.id)
                },
            })
        ])
    }

    return <div
        className="MarkerView"
        style={{
            "--ticks": props.time,
            "--duration": props.nextTime !== null ? props.nextTime - props.time : 0
        } as CSSProperties}
        onDoubleClick={e => e.stopPropagation()}
        onContextMenu={onContextMenu}
    >
        <div className="section" />
        <div className="line" />
        <div className="head" onMouseDown={onMouseDown}>
            <EditableText
                value={props.name}
                onChange={name => props.editor.setMarkerName(props.id, name)}
            />
            <div className="contextual" onClick={onContextualClick}>
                <Icon name="more_vert" />
            </div>
        </div>
    </div>
}
