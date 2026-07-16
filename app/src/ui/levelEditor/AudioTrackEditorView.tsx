import { EngineContext, useComponent } from "@niloc/ecs-react";
import { Vec2 } from "@niloc/utils";
import { useContext, useEffect, useRef } from "react";
import type { AudioTrackEditor } from "../../components/editor/AudioTrackEditor";
import type { TempoTrackEditor } from "../../components/editor/TempoTrackEditor";
import type { TimeTransform } from "../../components/editor/TimeTransform";
import { usePopupManager } from "../../hooks/usePopupManager";
import { Button } from "../button/Button";
import { NumberInput } from "../input/NumberInput";
import "./AudioTrackEditorView.scss";
import { TrackEditorContent, TrackEditorHead, TrackEditorView } from "./TrackEditorView";
import type { Time } from "../../components/Time";
import { Toggle } from "../toggle/Toggle";
import { Mixer } from "../../resources/Mixer";
import type { AudioWaveformRenderer } from "../../components/editor/AudioWaveformRenderer";
import { ElementRenderer } from "../ElementRenderer";
import { SelectDocumentPopup } from "../selectDocumentPopup/SelectDocumentPopup";
import type { DocumentEntity } from "../../queries/document/DocumentEntity";
import { useThrottle } from "../../hooks/useThrottle";

export function AudioTrackEditorView(props: {
    transform: TimeTransform,
    tempoTrack: TempoTrackEditor,
    editor: AudioTrackEditor,
    waveformRenderer: AudioWaveformRenderer,
    time: Time
}) {
    const { track } = useComponent(props.editor)
    const popupManager = usePopupManager()
    const { engine } = useContext(EngineContext)
    const mixer = engine.getResource(Mixer)
    const { enabled } = useComponent(mixer.audio)

    function onChoosePlayback() {
        function onSelect(document: DocumentEntity) {
            props.editor.setPlayback(document)
        }

        popupManager.add(close => <SelectDocumentPopup
            close={close}
            onSelect={onSelect}
        />)
    }

    return <TrackEditorView
        className="AudioTrackEditorView"
        transform={props.transform}
    >
        <TrackEditorHead>
            <NumberInput
                name="time"
                value={track.time}
                onChange={time => props.editor.setTime(time)}
                step={0.01}
            />
            <Button onClick={onChoosePlayback}>Choose playback</Button>
            <Toggle value={enabled} onChange={enabled => mixer.audio.setEnabled(enabled)} />
        </TrackEditorHead>

        <TrackEditorContent time={props.time}>
            <AudioView
                waveform={props.waveformRenderer}
            />
        </TrackEditorContent>
    </TrackEditorView>
}

function AudioView(props: {
    waveform: AudioWaveformRenderer,
}) {
    const ref = useRef<HTMLDivElement | null>(null)
    const resizeObserver = useRef<ResizeObserver | null>(null)
    const resizeThrottle = useThrottle(500)

    useEffect(() => {
        return () => {
            resizeObserver.current?.disconnect()
        }
    }, [])

    function onRef(element: HTMLDivElement | null) {
        ref.current = element

        resizeObserver.current?.disconnect()

        if (element) {
            props.waveform.setSize(Vec2.create(element.clientWidth, element.clientHeight))

            if (!resizeObserver.current) {
                resizeObserver.current = new ResizeObserver(() => {
                    resizeThrottle.call(() => {
                        if (!ref.current)
                            return;

                        props.waveform.setSize(Vec2.create(ref.current.clientWidth, ref.current.clientHeight))
                    })
                })
            }

            resizeObserver.current.observe(element)
        }
    }

    return <div
        className="AudioView"
        ref={onRef}
    >
        <ElementRenderer element={props.waveform.canvas} />
    </div>

}
