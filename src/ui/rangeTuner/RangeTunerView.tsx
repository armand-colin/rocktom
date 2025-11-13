import { EngineContext, useComponent } from "@niloc/ecs-react";
import { useContext, useEffect, useReducer, useRef } from "react";
import type { LiveInstrument } from "../../components/LiveInstrument";
import { RangeTuner, RangeTunerMode } from "../../components/RangeTuner";

export function RangeTunerView(props: { instrument: LiveInstrument }) {
    const { engine } = useContext(EngineContext)
    const rangeTuner = useRef<RangeTuner | null>(null)
    const [, forceUpdate] = useReducer(x => x + 1, 0)

    useEffect(() => {
        const tuner = engine.createComponent(RangeTuner, props.instrument)
        rangeTuner.current = tuner
        forceUpdate()

        return () => {
            tuner.destroy()
            if (rangeTuner.current === tuner) {
                rangeTuner.current = null
            }
        }
    }, [engine, props.instrument])

    if (!rangeTuner.current) {
        return null
    }

    return <Inside tuner={rangeTuner.current} />

}

function Inside(props: { tuner: RangeTuner }) {
    const { mode, volume } = useComponent(props.tuner)

    return <div className="RangeTuner">
        <h1>Range Tuner</h1>
        <button disabled={mode === RangeTunerMode.Silence} onClick={() => props.tuner.mode = RangeTunerMode.Silence}>Setup silence</button>
        <button disabled={mode === RangeTunerMode.Peak} onClick={() => props.tuner.mode = RangeTunerMode.Peak}>Setup peak</button>
        <button disabled={mode === RangeTunerMode.None} onClick={() => props.tuner.mode = RangeTunerMode.None}>Stop</button>
        <button onClick={() => props.tuner.save()}>Save</button>

        <p>{volume}</p>
    </div>
}