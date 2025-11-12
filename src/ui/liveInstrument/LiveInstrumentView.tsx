import { useComponent } from "@niloc/ecs-react";
import type { LiveInstrument } from "../../components/LiveInstrument";
import "./LiveInstrumentView.scss";

export function LiveInstrumentView(props: { instrument: LiveInstrument }) {
    const { volume } = useComponent(props.instrument)

    return <div className="LiveInstrumentView">
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
    </div>
}