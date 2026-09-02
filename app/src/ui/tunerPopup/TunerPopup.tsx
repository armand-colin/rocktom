import { useComponent } from "@niloc/ecs-react"
import { useMemo, type CSSProperties } from "react"
import type { LiveInstrument } from "../../components/LiveInstrument"
import { Tuner } from "../../components/Tuner"
import { FineNote } from "../../sound/note/Note"
import { Button, ButtonTheme } from "../button/Button"
import "./TunerPopup.scss"
import { Popup } from "../popup/Popup"
import { useComponentInstance } from "../../hooks/useComponentInstance"
import { Spinner } from "../spinner/Spinner"

export function TunerPopup(props: { instrument: LiveInstrument, close: () => void }) {
    const tuner = useComponentInstance(Tuner, props.instrument)

    return <Popup.BaseContainer className="TunerPopup w-100">
        <Popup.BaseTitle
            title="Tuner"
            close={props.close}
        />

        {
            tuner ?
                <TunerPopupContent instrument={props.instrument} tuner={tuner} /> :
                <div>
                    <Spinner />
                </div>
        }
    </Popup.BaseContainer>
}

function TunerPopupContent(props: { instrument: LiveInstrument, tuner: Tuner }) {
    const { detectedFrequency, targetString, locked } = useComponent(props.tuner)

    const cents = useMemo(() => {
        if (!targetString || detectedFrequency <= 0)
            return 0

        return FineNote.cents(targetString.note.frequency, detectedFrequency)
    }, [targetString, detectedFrequency])

    const status = !locked ? "idle" :
        Math.abs(cents) < 5 ? "success" :
            Math.abs(cents) < 10 ? "warn" :
                "error"

    const t = Math.max(Math.min(cents, 20), -20) / 40 + 0.5

    return <>
        <div className="flex gap-2">
            {
                props.instrument.instrument.strings.map(s => {
                    return <Button
                        onClick={() => props.tuner.targetString = s}
                        theme={props.tuner.targetString === s ? ButtonTheme.Primary : ButtonTheme.Default}
                        className="flex-1"
                    >
                        {s.name}
                    </Button>
                })
            }
        </div>

        <p data-locked={locked ? "true" : "false"}>{detectedFrequency > 0 ? `${detectedFrequency.toFixed(2)}Hz` : "—"}</p>
        <p data-locked={locked ? "true" : "false"}>{targetString && detectedFrequency > 0 ? cents : "—"}</p>

        <div
            className="tuner"
            data-status={status}
            data-locked={locked ? "true" : "false"}
            style={{
                "--t": t,
            } as CSSProperties}
        >
            <div className="caret"></div>
        </div>
    </>
}