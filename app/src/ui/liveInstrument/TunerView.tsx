import type { Tuner } from "../../components/Tuner";
import { useComponent } from "../../hooks/useComponent";
import type { Instrument } from "../../sound/instrument/Instrument";
import { Button } from "../button/Button";
import { TunerDial } from "../tunerDial/TunerDial";

export function TunerView(props: { instrument: Instrument, tuner: Tuner }) {
    useComponent(props.tuner)

    return <div>
        <div className="flex gap-2">
            {
                props.instrument.strings.map(string => <Button
                    key={string.index}
                    onClick={() => props.tuner.targetString = string}
                    className="flex-1"
                >
                    {string.name}
                </Button>)
            }
        </div>
        <TunerDial
            height={200}
            cents={props.tuner.detectedFrequency}
        />
    </div>

}