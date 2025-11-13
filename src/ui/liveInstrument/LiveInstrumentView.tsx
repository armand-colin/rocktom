import { EngineContext, useComponent, useResource } from "@niloc/ecs-react";
import type { LiveInstrument } from "../../components/LiveInstrument";
import "./LiveInstrumentView.scss";
import { Player } from "../../resources/Player";
import { InstrumentList } from "../instrumentList/InstrumentList";
import { useContext, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Workspace } from "../../resources/Workspace";
import { Schedules } from "../../Schedules";
import { TunerOverlay } from "../tunerOverlay/TunerOverlay";
import { Button } from "../button/Button";

export function LiveInstrumentView() {
    const { instrument } = useResource(Player)

    return <div className="LiveInstrumentView">
        {
            instrument ?
                <CurrentLiveInstrument instrument={instrument} /> :
                <InstrumentList />
        }
    </div>
}

function CurrentLiveInstrument(props: { instrument: LiveInstrument }) {
    const { volume } = useComponent(props.instrument)
    const { engine } = useContext(EngineContext)

    return <div className="CurrentLiveInstrument">
        <h1>{props.instrument.name}</h1>
        <input
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={volume}
            onChange={e => {
                props.instrument.volume = parseFloat(e.target.value)
            }}
        />
        <VolumePreview />
        <TuneButton />
        <Button onClick={(e) => {
            e.stopPropagation()
            engine.getResource(Player).setInstrument(null)
        }}>Remove</Button>
    </div>
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

        setOverlay(<TunerOverlay onClose={() => setOverlay(null)} />)
    }

    return <>
        <Button className="TuneButton" onClick={onClick}>
            Tune
        </Button>
        {overlay}
    </>
}

