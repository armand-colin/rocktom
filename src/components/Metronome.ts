import { Component, Engine } from "@niloc/ecs";
import { Tempo } from "../sound/Tempo";
import sound from "../assets/sounds/metronome-click.mp3"
import { SoundEngine } from "../resources/SoundEngine";
import type { TempoTrack } from "../sound/song/TempoTrack";

type NextTick = {
    perfect: number,
    adjusted: number
}

export class Metronome extends Component {

    static offsetSeconds = 0.28

    private _nextTick: NextTick
    private _buffer: AudioBuffer | null = null
    private _volume = 1.0
    private _tempoTrack: TempoTrack

    constructor(engine: Engine, tempoTrack: TempoTrack) {
        super(engine)
        this._tempoTrack = tempoTrack
        this._loadBuffer()
        this._nextTick = this._getNextTick(0)
    }
    
    get volume() {
        return this._volume
    }

    set volume(value: number) {
        this._volume = value
    }

    private _getNextTick(ticks: number): NextTick {
        const perfectNextTick = ticks - (ticks % Tempo.PPQ) + Tempo.PPQ
        const offset = this._tempoTrack.ticksFromSeconds(
            Metronome.offsetSeconds,
            perfectNextTick
        )

        return { perfect: perfectNextTick, adjusted: perfectNextTick - offset }
    }

    private _loadBuffer() {
        const soundEngine = this.engine.getResource(SoundEngine)
        fetch(sound)
            .then(response => response.arrayBuffer())
            .then(data => soundEngine.createAudioBuffer(data))
            .then(buffer => {
                this._buffer = buffer
            })
    }

    update(ticks: number) {
        if (ticks >= this._nextTick.adjusted) {
            this._click()

            const nextBase = ticks > this._nextTick.perfect ?
                ticks : this._nextTick.perfect
            this._nextTick = this._getNextTick(nextBase)
        }
    }

    reset() {
        this._nextTick = this._getNextTick(0)
    }

    click() {
        this._click()
    }

    private _click() {
        // Play click sound
        if (!this._buffer) 
            return
        
        const audioNode = this.engine.getResource(SoundEngine).createAudioBufferNode(this._buffer)
        const gain = this.engine.getResource(SoundEngine).createGainNode()
        gain.gain = this._volume
        audioNode.connect(gain)
        gain.connect(this.engine.getResource(SoundEngine).output)

        audioNode.play()
    }

}