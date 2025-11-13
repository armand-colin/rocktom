import { useComponent } from "@niloc/ecs-react";
import { useEffect, useRef } from "react";
import { AudioRangeTuner, AudioRangeTunerMode } from "../../components/AudioRangeTuner";
import type { LiveInstrument } from "../../components/LiveInstrument";
import { useComponentInstance } from "../../hooks/useComponentInstance";
import { Button } from "../button/Button";
import "./AudioRangeOverlay.scss";

export function AudioRangeOverlay(props: { instrument: LiveInstrument, onClose: () => void }) {
    const audioRangeTuner = useComponentInstance(AudioRangeTuner, props.instrument)
    const { mode, volume } = useComponent(audioRangeTuner)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    function draw() {
        console.log("drawing audio range overlay")
        const canvas = canvasRef.current
        if (!canvas) {
            return
        }

        const context = canvas.getContext("2d")!
        const width = canvas.width
        const height = canvas.height
        const frequencies = audioRangeTuner.frequencies
        const volume = audioRangeTuner.volume

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

        // Draw volume bar as an horizontal line
        context.fillStyle = "red"
        const volumeY = height - (volume / 1) * height
        context.fillRect(0, volumeY, width, 2);
    }

    useEffect(() => {
        draw()
    }, [volume])

    return <div className="AudioRangeOverlay">
        <div className="body">
            <Button onClick={props.onClose}>Close</Button>
            <div className="buttons">
                <Button onClick={() => { audioRangeTuner.mode = AudioRangeTunerMode.Silence }} data-active={mode === AudioRangeTunerMode.Silence}>Silence</Button>
                <Button onClick={() => { audioRangeTuner.mode = AudioRangeTunerMode.Peak }} data-active={mode === AudioRangeTunerMode.Peak}>Peak</Button>
                <Button onClick={() => { audioRangeTuner.mode = AudioRangeTunerMode.None }} data-active={mode === AudioRangeTunerMode.None}>None</Button>
            </div>
            <Button onClick={() => { audioRangeTuner.save() }}>Save</Button>
            <h1>Tune audio range</h1>
            <p>Mode: {AudioRangeTunerMode[mode]}</p>
            <canvas ref={canvasRef}></canvas>
        </div>
    </div>
}