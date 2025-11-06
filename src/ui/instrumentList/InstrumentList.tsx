import { EngineContext, useResource } from "@niloc/ecs-react";
import { useContext, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { LiveInstrument } from "../../components/LiveInstrument";
import { LiveInstrumentPreferences } from "../../resources/LiveInstrumentPreferences";
import { MediaStreamList, type MediaStreamDescription } from "../../resources/MediaStreamList";
import { Player } from "../../resources/Player";
import { SoundEngine } from "../../resources/SoundEngine";
import { Tuner } from "../../resources/Tuner";
import { Workspace } from "../../resources/Workspace";
import { Schedules } from "../../Schedules";
import { Bass } from "../../sound/instrument/Instrument";
import { FineNote } from "../../sound/note/Note";
import "./InstrumentList.scss";

export function InstrumentList() {
    const mediaStreamList = useResource(MediaStreamList)

    console.log("InstrumentList render", mediaStreamList.streams)
    function onRefresh() {
        mediaStreamList.refresh()
    }

    return <div className="InstrumentList">
        <h1>Microphone selection</h1>

        <button onClick={onRefresh}>Refresh</button>

        <ul>
            {
                mediaStreamList.streams.map(stream => {
                    return <StreamItem
                        key={stream.deviceId}
                        stream={stream}
                    />
                })
            }
        </ul>
    </div>
}

function StreamItem(props: { stream: MediaStreamDescription }) {
    const player = useResource(Player)
    const liveInstrumentPreferences = useResource(LiveInstrumentPreferences)
    const { engine } = useContext(EngineContext)

    async function onClick() {
        liveInstrumentPreferences.deviceId = props.stream.deviceId
        const stream = await liveInstrumentPreferences.getMediaStream()
        const liveInstrument = engine.createComponent(LiveInstrument, stream, props.stream.deviceId, props.stream.label)
        engine.getResource(SoundEngine).resume()
        player.setInstrument(liveInstrument)
    }
    const isActive = player.instrument?.streamId === props.stream.deviceId

    return <li
        className="StreamItem"
        data-active={isActive}
        onClick={onClick}
    >
        <p>{props.stream.label || "Unnamed device"}</p>
        {
            isActive ?
                <>
                    <VolumePreview />
                    <TuneButton />
                    <button onClick={(e) => {
                        e.stopPropagation()
                        player.setInstrument(null)
                    }}>Remove</button>
                </> :
                undefined
        }
    </li>
}

function VolumePreview() {
    const engine = useContext(EngineContext).engine
    const workspace = engine.getResource(Workspace)
    const [volume, setVolume] = useState(0)


    useEffect(() => {
        function* update() {
            while (true) {
                const volume = workspace.analyser.getVolume()
                setVolume(volume)
                yield Schedules.Frame
            }
        }

        const coroutine = engine.scheduler.add(update())

        return () => {
            coroutine.cancel()
        }
    }, [engine, workspace])

    return <div
        className="VolumePreview"
        style={{
            "--volume": volume
        } as CSSProperties}
    >
        <div className="bar"></div>
    </div>
}

function TuneButton() {
    const [overlay, setOverlay] = useState<ReactNode | null>(null)

    function onClick() {
        if (overlay !== null) {
            setOverlay(null)
            return
        }

        setOverlay(<TuneOverlay onClose={() => setOverlay(null)} />)
    }

    return <>
        <button className="TuneButton" onClick={onClick}>
            Tune
        </button>
        {overlay}
    </>
}

const instrument = new Bass()

function TuneOverlay(props: { onClose: () => void }) {
    const [string, setString] = useState(instrument.strings[0])
    const tuner = useResource(Tuner)

    const cents = useMemo(() => {
        return FineNote.cents(string.note.frequency, tuner.detectedFrequency)
    }, [string, tuner.detectedFrequency])

    const status = Math.abs(cents) < 5 ? "success" :
        Math.abs(cents) < 10 ? "warn" :
            "error"

    const t = Math.max(Math.min(cents, 20), -20) / 40 + 0.5

    return <div className="TuneOverlay">
        <div className="body">
            <button onClick={props.onClose}>Close</button>

            <div className="strings">
                {
                    instrument.strings.map(s => {
                        return <button
                            onClick={() => setString(s)}
                            data-active={s === string}
                            style={{
                                "--color": "#" + s.color.getHexString()
                            } as CSSProperties}
                        >
                            {s.name}
                        </button>
                    })
                }
            </div>

            <p>{cents}</p>
            <div
                className="tuner"
                data-status={status}
                style={{
                    "--t": t,
                } as CSSProperties}
            >
                <div className="caret"></div>
            </div>
        </div>
    </div>
}