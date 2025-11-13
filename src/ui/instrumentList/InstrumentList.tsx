import { EngineContext, useResource } from "@niloc/ecs-react";
import { useContext } from "react";
import { LiveInstrument } from "../../components/LiveInstrument";
import { LiveInstrumentPreferences } from "../../resources/LiveInstrumentPreferences";
import { MediaStreamList, type MediaStreamDescription } from "../../resources/MediaStreamList";
import { Player } from "../../resources/Player";
import { SoundEngine } from "../../resources/SoundEngine";
import "./InstrumentList.scss";

export function InstrumentList() {
    const mediaStreamList = useResource(MediaStreamList)

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

    return <li
        className="StreamItem"
        onClick={onClick}
    >
        <p>{props.stream.label || "Unnamed device"}</p>
    </li>
}
