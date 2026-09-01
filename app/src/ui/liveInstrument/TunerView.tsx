import type { Tuner } from "../../components/Tuner";
import { useComponent } from "../../hooks/useComponent";
import { TunerDial } from "../tunerDial/TunerDial";

export function TunerView(props: { tuner: Tuner }) {
    useComponent(props.tuner)

    return <div>
        <TunerDial
            height={200}
            cents={props.tuner.detectedFrequency}
        />
    </div>

}