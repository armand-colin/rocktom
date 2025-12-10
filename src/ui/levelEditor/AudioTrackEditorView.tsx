import { EngineContext, useComponent } from "@niloc/ecs-react";
import { Duration, Vec2 } from "@niloc/utils";
import { useContext, useEffect, useRef, useState } from "react";
import type { AudioTrackEditor } from "../../components/editor/AudioTrackEditor";
import type { TempoTrackEditor } from "../../components/editor/TempoTrackEditor";
import type { TimeTransform } from "../../components/editor/TimeTransform";
import { usePopupManager } from "../../hooks/usePopupManager";
import { AudioType } from "../../sound/song/AudioTrack";
import { UrlAudio } from "../../utils/UrlAudio";
import { YouTubeAudio } from "../../utils/YouTubeAudio";
import { Button } from "../button/Button";
import { NumberInput } from "../input/NumberInput";
import { Select } from "../select/Select";
import "./AudioTrackEditorView.scss";
import { TrackEditorContent, TrackEditorHead, TrackEditorView } from "./TrackEditorView";
import type { Time } from "../../components/Time";
import { Toggle } from "../toggle/Toggle";
import { Mixer } from "../../resources/Mixer";
import type { AudioWaveformRenderer } from "../../components/editor/AudioWaveformRenderer";
import { ElementRenderer } from "../ElementRenderer";

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

    function onTypeChange(type: AudioType) {
        props.editor.setType(type)
    }

    function onSetUrl() {
        if (track.payload.type === AudioType.Url)
            popupManager.add(close => <UrlPopup
                close={close}
                onValidate={data => {
                    props.editor.setDuration(data.duration)
                    props.editor.setUrl(data.url)
                    close()
                }}
            />)
        if (track.payload.type === AudioType.YouTube)
            popupManager.add(close => <YouTubePopup
                close={close}
                onValidate={data => {
                    props.editor.setDuration(data.duration)
                    props.editor.setYouTubeVideoId(data.youtubeVideoId)
                    close()
                }}
            />)
    }

    return <TrackEditorView
        className="AudioTrackEditorView"
        transform={props.transform}
    >
        <TrackEditorHead>
            <Select
                options={[
                    { value: AudioType.None, label: "None" },
                    { value: AudioType.Url, label: "URL" },
                    { value: AudioType.YouTube, label: "YouTube" },
                ]}
                value={track.payload.type}
                onChange={onTypeChange}
            />
            {
                track.payload.type === AudioType.None ?
                    undefined :
                    <>
                        <NumberInput
                            name="time"
                            value={track.time}
                            onChange={time => props.editor.setTime(time)}
                            step={0.01}
                        />
                        <Button onClick={onSetUrl}>Set url</Button>
                    </>
            }
            <Toggle value={enabled} onChange={enabled => mixer.audio.setEnabled(enabled)} />
        </TrackEditorHead>

        <TrackEditorContent time={props.time}>
            {
                track.payload.type === AudioType.Url || track.payload.type === AudioType.YouTube ?
                    <AudioView
                        waveform={props.waveformRenderer}
                    /> :
                    undefined
            }
        </TrackEditorContent>

    </TrackEditorView>
}

function AudioView(props: {
    waveform: AudioWaveformRenderer,
}) {
    const ref = useRef<HTMLDivElement | null>(null)
    const resizeObserver = useRef<ResizeObserver | null>(null)

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
                    if (ref.current) {
                        props.waveform.setSize(Vec2.create(ref.current.clientWidth, ref.current.clientHeight))
                    }
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

function UrlPopup(props: {
    close: () => void,
    onValidate: (data: { url: string, duration: number }) => void
}) {
    const [url, setUrl] = useState("")

    function onValidate() {
        UrlAudio.getDuration(url)
            .then(duration => {
                props.onValidate({ url, duration: Duration.seconds(duration) })
            })
            .catch(e => {
                console.error(e)
            })
    }

    return <div>
        <h2>Set Audio URL</h2>
        <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Audio URL"
        />
        <Button onClick={onValidate}>Validate</Button>
        <Button onClick={props.close}>Cancel</Button>
    </div>
}

function YouTubePopup(props: {
    close: () => void,
    onValidate: (data: { youtubeVideoId: string, duration: number }) => void
}) {
    const { engine } = useContext(EngineContext)
    const [youtubeVideoId, setYouTubeVideoId] = useState("")

    function onValidate() {
        YouTubeAudio.getDuration(engine, youtubeVideoId)
            .then(duration => {
                props.onValidate({ youtubeVideoId, duration: Duration.seconds(duration) })
            })
            .catch(e => {
                console.error(e)
            })
    }

    return <div>
        <h2>Set YouTube Video ID</h2>
        <input
            type="text"
            value={youtubeVideoId}
            onChange={e => setYouTubeVideoId(e.target.value)}
            placeholder="YouTube Video ID"
        />
        <Button onClick={onValidate}>Validate</Button>
        <Button onClick={props.close}>Cancel</Button>
    </div>
}