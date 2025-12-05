import { EngineContext, useComponent } from "@niloc/ecs-react";
import { Duration } from "@niloc/utils";
import { useContext, useState, type CSSProperties } from "react";
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
import type { TempoTrack } from "../../sound/song/TempoTrack";
import type { Time } from "../../components/Time";

export function AudioTrackEditorView(props: {
    transform: TimeTransform,
    tempoTrack: TempoTrackEditor,
    editor: AudioTrackEditor,
    time: Time
}) {
    const { track } = useComponent(props.editor)
    const popupManager = usePopupManager()

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
        </TrackEditorHead>

        <TrackEditorContent time={props.time}>
            {
                track.payload.type === AudioType.Url || track.payload.type === AudioType.YouTube ?
                    <AudioView
                        time={track.time}
                        duration={track.duration}
                        tempo={props.tempoTrack.track}
                    /> :
                    undefined
            }
        </TrackEditorContent>

    </TrackEditorView>
}

function AudioView(props: { time: number, duration: number, tempo: TempoTrack }) {
    const ticks = props.tempo.ticksFromSeconds(props.time)
    const duration = props.tempo.ticksFromSeconds(props.duration, ticks)

    return <div
        className="AudioView"
        style={{
            "--ticks": ticks,
            "--duration": duration
        } as CSSProperties}
    ></div>
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