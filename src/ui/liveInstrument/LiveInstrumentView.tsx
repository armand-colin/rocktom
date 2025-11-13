import { EngineContext, useComponent, useResource } from "@niloc/ecs-react";
import { useContext, useState, type CSSProperties, type ReactNode } from "react";
import { AudioInspector } from "../../components/AudioInspector";
import type { LiveInstrument } from "../../components/LiveInstrument";
import { useComponentInstance } from "../../hooks/useComponentInstance";
import { Player } from "../../resources/Player";
import { AudioRangeOverlay } from "../audioRangeOverlay/AudioRangeOverlay";
import { Button } from "../button/Button";
import { InstrumentList } from "../instrumentList/InstrumentList";
import { TunerOverlay } from "../tunerOverlay/TunerOverlay";
import "./LiveInstrumentView.scss";

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
            max="10"
            step="0.05"
            value={volume}
            onChange={e => {
                props.instrument.volume = parseFloat(e.target.value)
            }}
        />
        <VolumePreview instrument={props.instrument} />
        <TuneButton instrument={props.instrument} />
        <AudioRangeTuneButton instrument={props.instrument} />
        <Button onClick={(e) => {
            e.stopPropagation()
            engine.getResource(Player).setInstrument(null)
        }}>Remove</Button>
    </div>
}

function VolumePreview(props: { instrument: LiveInstrument }) {
    const inspector = useComponentInstance(AudioInspector, props.instrument.rawOutput)
    const { volume } = useComponent(inspector)

    return <div
        className="VolumePreview"
        style={{
            "--volume": volume
        } as CSSProperties}
    >
        <div className="bar"></div>
    </div>
}

function TuneButton(props: { instrument: LiveInstrument }) {
    const [overlay, setOverlay] = useState<ReactNode | null>(null)

    function onClick() {
        if (overlay !== null) {
            setOverlay(null)
            return
        }

        setOverlay(<TunerOverlay
            onClose={() => setOverlay(null)}
            instrument={props.instrument}
        />)
    }

    return <>
        <Button className="TuneButton" onClick={onClick}>
            Tune
        </Button>
        {overlay}
    </>
}

function AudioRangeTuneButton(props: { instrument: LiveInstrument }) {
    const [overlay, setOverlay] = useState<ReactNode | null>(null)

    function onClick() {
        if (overlay !== null) {
            setOverlay(null)
            return
        }
        setOverlay(<AudioRangeOverlay
            onClose={() => setOverlay(null)}
            instrument={props.instrument}
        />)
    }

    return <>
        <Button className="AudioRangeTuneButton" onClick={onClick}>
            Audio Range ({props.instrument.range.silence.toFixed(0) + " - " + props.instrument.range.peak.toFixed(0)})
        </Button>
        {overlay}
    </>
}