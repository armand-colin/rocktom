import { useComponent } from "@niloc/ecs-react"
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import type { LiveInstrument } from "../../components/LiveInstrument"
import { Tuner } from "../../components/Tuner"
import { useComponentInstance } from "../../hooks/useComponentInstance"
import { Bass } from "../../sound/instrument/Instrument"
import { FineNote } from "../../sound/note/Note"
import { Button } from "../button/Button"
import "./TunerOverlay.scss"

const bass = new Bass()

export function TunerOverlay(props: { instrument: LiveInstrument, onClose: () => void }) {
    const [string, setString] = useState(bass.strings[0])
    const tuner = useComponentInstance(Tuner, props.instrument)
    const { detectedFrequency } = useComponent(tuner)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    const cents = useMemo(() => {
        return FineNote.cents(string.note.frequency, detectedFrequency)
    }, [string, detectedFrequency])

    const status = Math.abs(cents) < 5 ? "success" :
        Math.abs(cents) < 10 ? "warn" :
            "error"

    const t = Math.max(Math.min(cents, 20), -20) / 40 + 0.5

    function draw() {
        const canvas = canvasRef.current
        if (!canvas) {
            return
        }

        const context = canvas.getContext("2d")!
        const width = canvas.width
        const height = canvas.height
        const frequencies = tuner.frequencies
        const frequency = tuner.detectedFrequency

        context.clearRect(0, 0, width, height)

        context.fillStyle = "black"
        context.fillRect(0, 0, width, height)
        context.fillStyle = "lime"

        // Draw filled shape
        const barWidth = width / frequencies.length
        context.beginPath()
        context.moveTo(0, height)
        for (let i = 0; i < frequencies.length; i++) {
            const value = frequencies[i]
            const barHeight = value * height
            context.lineTo(i * barWidth, height - barHeight)
        }
        context.lineTo(width, height)
        context.closePath()
        context.fill()

        // Draw frequency as a vertical line at correct frequency
        context.fillStyle = "red"
        const frequencyX = (frequency / (tuner.frequencyStep * frequencies.length)) * width
        context.fillRect(frequencyX, 0, 2, height);
    }

    useEffect(() => {
        draw()
    }, [detectedFrequency])


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

            <canvas ref={canvasRef}></canvas>
        </div>
    </div>
}