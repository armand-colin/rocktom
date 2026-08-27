import { useComponent } from "@niloc/ecs-react"
import { useMemo, type CSSProperties } from "react"
import type { LiveInstrument } from "../../components/LiveInstrument"
import { Tuner } from "../../components/Tuner"
import { useComponentInstance } from "../../hooks/useComponentInstance"
import { Bass } from "../../sound/instrument/Instrument"
import { FineNote } from "../../sound/note/Note"
import { Button } from "../button/Button"
import "./TunerOverlay.scss"

const bass = new Bass()

export function TunerOverlay(props: { instrument: LiveInstrument, onClose: () => void }) {
    const tuner = useComponentInstance(Tuner, props.instrument)
    const { detectedFrequency, targetString, locked } = useComponent(tuner)

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


    return <div className="TunerOverlay">
        <div className="body">
            <Button onClick={props.onClose}>Close</Button>

            <div className="strings">
                {
                    bass.strings.map(s => {
                        return <Button
                            onClick={() => tuner.targetString = s}
                            data-active={s === targetString}
                            style={{
                                "--color": "#" + s.color.getHexString()
                            } as CSSProperties}
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
        </div>
    </div>
}