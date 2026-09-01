import type { Tuner } from "../../components/Tuner";
import { useComponent } from "../../hooks/useComponent";
import type { Instrument } from "../../sound/instrument/Instrument";
import { FineNote } from "../../sound/note/Note";
import { Button, ButtonTheme } from "../button/Button";
import { FormInputField } from "../form/FormInputField";
import { Toggle } from "../toggle/Toggle";
import { TunerDial } from "../tunerDial/TunerDial";
import { TunerDialUtils } from "../tunerDial/TunerDialUtils";

export function TunerView(props: { instrument: Instrument, tuner: Tuner }) {
    useComponent(props.tuner)

    const disabled = props.tuner.targetString === null || props.tuner.clarity < 0.2

    const cents = disabled ? 0 :
        FineNote.cents(props.tuner.targetString?.note.frequency ?? 0, props.tuner.detectedFrequency)

    const status = disabled ?
        TunerDialUtils.Status.Idle :
        Math.abs(cents) > 20 ? TunerDialUtils.Status.Error :
            Math.abs(cents) > 10 ? TunerDialUtils.Status.Warn :
                TunerDialUtils.Status.Success

    return <div className="TunerView gap-2 grid">
        <FormInputField label="Auto Detect">
            <Toggle
                value={props.tuner.autoDetect}
                onChange={value => props.tuner.autoDetect = value}
            />
            </FormInputField>

        <div className="flex gap-2">
            {
                props.instrument.strings.map(string => <Button
                    key={string.index}
                    onClick={() => props.tuner.targetString = string}
                    className="flex-1"
                    theme={props.tuner.targetString === string ? ButtonTheme.Primary : ButtonTheme.Default}
                >
                    {string.name}
                </Button>)
            }
        </div>

        <TunerDial
            height={200}
            cents={cents}
            disabled={disabled}
            referenceFrequency={props.tuner.targetString?.note.frequency}
            status={status}
        />
    </div>

}