import { useMemo, useState, type CSSProperties } from "react"
import "./TunerOverlay.scss"
import { Bass } from "../../sound/instrument/Instrument"
import { useResource } from "@niloc/ecs-react"
import { Tuner } from "../../resources/Tuner"
import { FineNote } from "../../sound/note/Note"
import { Button } from "../button/Button"

const bass = new Bass()

export function TunerOverlay(props: { onClose: () => void }) {
    const [string, setString] = useState(bass.strings[0])
    const tuner = useResource(Tuner)

    const cents = useMemo(() => {
        return FineNote.cents(string.note.frequency, tuner.detectedFrequency)
    }, [string, tuner.detectedFrequency])

    const status = Math.abs(cents) < 5 ? "success" :
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
                            onClick={() => setString(s)}
                            data-active={s === string}
                            style={{
                                "--color": "#" + s.color.getHexString()
                            } as CSSProperties}
                        >
                            {s.name}
                        </Button>
                    })
                }
            </div>

            <p>{cents}</p>

            <div
                className="tuner"
                data-status={status}
                style={{
                    "--t": t,
                } as CSSProperties}
            >
                <div className="caret"></div>
            </div>
        </div>
    </div>
}