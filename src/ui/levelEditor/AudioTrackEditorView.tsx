import { EngineContext, useComponent } from "@niloc/ecs-react";
import { Duration, Vec2 } from "@niloc/utils";
import { useContext, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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
import { AudioWaveform } from "../../utils/AudioWaveform";
import type { AudioWaveformRenderer } from "../../components/editor/AudioWaveformRenderer";
import { ElementRenderer } from "../ElementRenderer";

export function AudioTrackEditorView(props: {
    transform: TimeTransform,
    tempoTrack: TempoTrackEditor,
    editor: AudioTrackEditor,
    waveformRenderer: AudioWaveformRenderer,
    time: Time
}) {
    const { track, audioData } = useComponent(props.editor)
    const popupManager = usePopupManager()
    const { engine } = useContext(EngineContext)
    const mixer = engine.getResource(Mixer)
    const { enabled } = useComponent(mixer.audio)

    function onTypeChange(type: AudioType) {
        props.editor.setType(type)
    }

    console.log('render audioEditorTrack')

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
                    <AudioView2
                        waveform={props.waveformRenderer}
                    /> :
                    undefined
            }
        </TrackEditorContent>

    </TrackEditorView>
}

function AudioView2(props: {
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
        className="AudioView2"
        ref={onRef}
    >
        <ElementRenderer element={props.waveform.canvas} />
    </div>

}

function AudioView(props: {
    time: number,
    duration: number,
    tempo: TempoTrackEditor,
    audioData: string | null,
    editor: AudioTrackEditor
}) {
    const { track: tempoTrack } = useComponent(props.tempo)

    const ticks = tempoTrack.ticksFromSeconds(props.time)
    const duration = tempoTrack.ticksFromSeconds(props.duration, ticks)

    const segments = useMemo(() => {
        const segments: {
            ticks: number,
            duration: number,
            seconds: number,
            durationSeconds: number
        }[] = []

        const startTicks = ticks
        const startSeconds = props.time

        let lastTicks = startTicks
        let lastSeconds = startSeconds

        for (let i = 0; i < tempoTrack.events.length; i++) {
            const event = tempoTrack.events[i]
            if (event.ticks > lastTicks) {
                // must push segment at this point
                segments.push({
                    ticks: lastTicks - startTicks,
                    duration: event.ticks - lastTicks,
                    seconds: lastSeconds - startSeconds,
                    durationSeconds: event.time - lastSeconds
                })

                lastTicks = event.ticks
                lastSeconds = event.time
            }
        }

        if (lastTicks - startTicks < duration) {
            segments.push({
                ticks: lastTicks - startTicks,
                duration: duration - (lastTicks - startTicks),
                seconds: lastSeconds - startSeconds,
                durationSeconds: props.duration - (lastSeconds - startSeconds)
            })
        }

        return segments
    }, [tempoTrack.events, ticks, duration, props.time, props.duration])

    return <div
        className="AudioView"
        style={{
            "--ticks": ticks,
            "--duration": duration,
        } as CSSProperties}
    >
        {
            segments.map(segment => <AudioSegmentView
                key={segment.ticks}
                seconds={segment.seconds}
                durationSeconds={segment.durationSeconds}
                audioDuration={props.duration}
                ticks={segment.ticks}
                duration={segment.duration}
                editor={props.editor}
                audioData={props.audioData}
            />)
        }
    </div>
}

function AudioSegmentView(props: {
    seconds: number,
    durationSeconds: number,
    audioData: string | null,
    audioDuration: number,
    ticks: number,
    duration: number,
    editor: AudioTrackEditor
}) {
    const [waveform, setWaveform] = useState<string | null>(null)

    useEffect(() => {
        setWaveform(null)

        if (props.audioData === null)
            return

        let cancelled = false

        console.log("getting waveform", props.seconds, props.seconds + props.durationSeconds)
        props.editor.getAudioWaveform(props.seconds, props.seconds + props.durationSeconds)
            .then(image => {
                if (!cancelled)
                    setWaveform(image)
            })
            .catch(e => {
                console.error("Failed to generate audio waveform:", e)
            })

        return () => {
            cancelled = true
        }

    }, [props.seconds, props.durationSeconds, props.audioData])

    return <div className="AudioSegmentView"
        style={{
            "--ticks": props.ticks,
            "--duration": props.duration,
        } as CSSProperties}
    >
        {
            waveform
                ? <img src={waveform} /> :
                undefined
        }
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