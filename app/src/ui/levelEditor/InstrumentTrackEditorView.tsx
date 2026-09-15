import type { MouseEvent } from "react";
import type { InstrumentTrackEditor } from "../../components/editor/InstrumentTrackEditor";
import type { LevelEditor } from "../../components/editor/LevelEditor";
import type { TimedPattern } from "../../sound/song/Pattern";
import { Button, ButtonTheme } from "../button/Button";
import { Icon } from "../icon/Icon";
import { FocusTrackEditorView } from "./FocusTrackEditorView";
import { MarkerEditorView } from "./MarkerEditorView";
import { NoteTrackEditorView } from "./NoteTrackEditorView";
import { TrackEditorHead, TrackEditorView } from "./TrackEditorView";
import { Instance } from "../../Instance";
import { ContextualMenu } from "../../resources/contextualMenu/ContextualMenu";
import { ContextualMenuItem } from "../../resources/contextualMenu/ContextualMenuItem";
import { usePopupManager } from "../../hooks/usePopupManager";
import { AddInstrumentTrackPopup } from "./AddInstrumentTrackPopup";
import { UiSize } from "../UiSize";
import { InstrumentDropdown } from "../instrumentDropdown/InstrumentDropdown";
import type { Instrument } from "../../sound/instrument/Instrument";
import { useComponent } from "../../hooks/useComponent";

export function InstrumentTrackEditorView(props: {
    editor: LevelEditor,
    trackEditor: InstrumentTrackEditor,
}) {
    const popupManager = usePopupManager()
    function onEdit(pattern: TimedPattern) {
        props.editor.player.seekTicks(pattern.time)
        props.editor.editPattern(pattern)
    }

    const { instrument, open } = useComponent(props.trackEditor)

    function onTrackContextMenu(e: MouseEvent) {
        e.preventDefault()
        e.stopPropagation()

        const contextualMenu = Instance.engine.getResource(ContextualMenu)

        const actions = [
            ContextualMenuItem.action({
                label: open ? "Hide track" : "Show track",
                icon: open ? "visibility_off" : "visibility",
                action: () => {
                    props.trackEditor.setOpen(!open)
                },
            }),
            ContextualMenuItem.action({
                label: "Create track after",
                icon: "add",
                action: () => {
                    popupManager.add(close => <AddInstrumentTrackPopup
                        close={close}
                        editor={props.editor}
                        placeAfter={props.trackEditor.track}
                    />)
                },
            }),
        ]

        if (props.editor.instrumentTracks.length > 1) {
            actions.push(ContextualMenuItem.action({
                label: "Delete track",
                icon: "delete",
                theme: ButtonTheme.Danger,
                action: () => {
                    props.editor.removeInstrumentTrack(props.trackEditor.track.id)
                },
            }))
        }

        contextualMenu.open(e.nativeEvent, actions)
    }

    function onInstrumentChange(instrument: Instrument) {
        props.trackEditor.setInstrument(instrument)
    }

    return <div className="grid gap-2">
        <TrackEditorView transform={props.editor.timeTransform}>
            <TrackEditorHead>
                <div className="flex items-center gap-2">
                    <InstrumentDropdown
                        value={instrument}
                        onChange={onInstrumentChange}
                        className="flex-1"
                        size={UiSize.S}
                    />
                    <Button shape="square" onClick={() => props.trackEditor.setOpen(!open)} size={UiSize.S}>
                        <Icon name={open ? "visibility" : "visibility_off"} />
                    </Button>
                    <Button shape="square" onClick={onTrackContextMenu} size={UiSize.S}>
                        <Icon name="more_vert" />
                    </Button>
                </div>
            </TrackEditorHead>
        </TrackEditorView>
        {
            open && <>
                <div className="markers">
                    <MarkerEditorView
                        time={props.editor.player.time}
                        transform={props.editor.timeTransform}
                        editor={props.trackEditor.noteTrack}
                    />
                </div>
                <div className="note">
                    <NoteTrackEditorView
                        onEdit={onEdit}
                        time={props.editor.player.time}
                        transform={props.editor.timeTransform}
                        trackEditor={props.trackEditor.noteTrack}
                        editor={props.editor}
                    />
                </div>
                <div className="focus">
                    <FocusTrackEditorView
                        time={props.editor.player.time}
                        transform={props.editor.timeTransform}
                        editor={props.trackEditor.focusTrack}
                    />
                </div>
            </>
        }
    </div>
}