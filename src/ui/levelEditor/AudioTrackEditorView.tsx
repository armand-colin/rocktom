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

export function AudioTrackEditorView(props: {
    transform: TimeTransform,
    tempoTrack: TempoTrackEditor,
    editor: AudioTrackEditor
}) {
    const { track } = useComponent(props.editor)
    const { track: tempoTrack } = useComponent(props.tempoTrack)
    const { ratio, offset } = useComponent(props.transform)
    const popupManager = usePopupManager()

    function onTypeChange(type: AudioType) {
        props.editor.setType(type)
    }

    const startTicks = tempoTrack.ticksFromSeconds(track.time)
    const endTicks = tempoTrack.ticksFromSeconds(track.time + track.duration)
    const durationTicks = endTicks - startTicks

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

    return <div
        className="AudioTrackEditorView"
        style={{
            "--ratio": ratio,
            "--offset": offset
        } as CSSProperties}
    >
        <div className="head">
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
        </div>
        <div
            className="content"
            style={{
                "--ticks": startTicks,
                "--duration": durationTicks
            } as CSSProperties}
        >
            {
                track.payload.type === AudioType.Url ?
                    <div className="audio"></div>
                    : track.payload.type === AudioType.YouTube ?
                        <div className="audio"></div>
                        : undefined
            }
        </div>
    </div >
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