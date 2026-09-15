import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react"
import { Instance } from "../../Instance"
import { Mixer } from "../../resources/Mixer"
import { SoundEngine } from "../../resources/SoundEngine"
import { Instrument } from "../../sound/instrument/Instrument"
import { VirtualBass } from "./VirtualBass"

export default {
    title: "VirtualInstrument/VirtualBass",
}

export const Default = () => {
    const engine = Instance.engine
    const [held, setHeld] = useState(false)

    const bass = useMemo(() => {
        const mixer = engine.getResource(Mixer)
        return engine.createComponent(
            VirtualBass,
            Instrument.BassStandard,
            mixer.virtualInstrument,
        )
    }, [engine])

    const string = bass.instrument.strings[0]
    const note = string.note
    const heldRef = useRef(false)

    useEffect(() => {
        return () => {
            bass.destroy()
        }
    }, [bass])

    function resumeAudio() {
        engine.getResource(SoundEngine).resume()
    }

    function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
        event.currentTarget.setPointerCapture(event.pointerId)
        resumeAudio()
        bass.playNote(note, string)
        heldRef.current = true
        setHeld(true)
    }

    function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
        if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId)

        if (!heldRef.current)
            return

        bass.stopNote(note, string)
        heldRef.current = false
        setHeld(false)
    }

    return (
        <div style={{ padding: 24, fontFamily: "Lexend, sans-serif", color: "#eee" }}>
            <p style={{ marginBottom: 12, opacity: 0.8 }}>
                Hold to play {string.name} open ({note.name}{note.octave})
            </p>
            <div
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                style={{
                    width: 280,
                    height: 160,
                    borderRadius: 8,
                    display: "grid",
                    placeItems: "center",
                    userSelect: "none",
                    cursor: "pointer",
                    background: held ? "#3a6e4a" : "#2a2a2a",
                    border: "1px solid #555",
                    transition: "background 80ms ease",
                }}
            >
                {held ? "Playing…" : "Press and hold"}
            </div>
        </div>
    )
}
