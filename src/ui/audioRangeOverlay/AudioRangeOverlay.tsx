import type { LiveInstrument } from "../../components/LiveInstrument";
import { useComponentInstance } from "../../hooks/useComponentInstance";

export function AudioRangeOverlay(props: { instrument: LiveInstrument }) {
    const audioRangeTuner = useComponentInstance(AudioRange)
    return <div className="AudioRangeOverlay">

    </div>
}