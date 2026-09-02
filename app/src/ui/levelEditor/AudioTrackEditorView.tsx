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
import { Mixer } from "../../resources/Mixer";
import type { AudioWaveformRenderer } from "../../components/editor/AudioWaveformRenderer";
import { ElementRenderer } from "../ElementRenderer";
import { SelectDocumentPopup } from "../selectDocumentPopup/SelectDocumentPopup";
import type { DocumentEntity } from "../../queries/document/DocumentEntity";
import { useThrottle } from "../../hooks/useThrottle";
import { FormInputField } from "../form/FormInputField";
import { MixerButton } from "../mixerButton/MixerButton";

export function AudioTrackEditorView(props: {
    transform: TimeTransform,
    tempoTrack: TempoTrackEditor,
    editor: AudioTrackEditor,
    waveformRenderer: AudioWaveformRenderer,
    time: Time
}) {
    const { track, playback } = useComponent(props.editor)
    const popupManager = usePopupManager()
    const { engine } = useContext(EngineContext)
    const mixer = engine.getResource(Mixer)

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
        <TrackEditorHead
            title="Audio track"
        >
            <FormInputField label="Start audio time (seconds)">
                <NumberInput
                    name="time"
                    value={track.time}
                    onChange={time => props.editor.setTime(time)}
                    step={0.01}
                />
            </FormInputField>

            <FormInputField label="Playback">
                {
                    playback ?
                        <span className="whitespace-nowrap text-ellipsis overflow-hidden w-full block">{playback.filename}</span> :
                        <span className="text-grey-200">No playback</span>
                }
            </FormInputField>
            <Button onClick={onChoosePlayback}>Choose playback</Button>

            <div className="absolute right-0 top-0 p-2">
                <MixerButton channel={mixer.audio} />
            </div>
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
        <ElementRenderer 
            element={props.waveform.canvas} 
        />
    </div>

}
