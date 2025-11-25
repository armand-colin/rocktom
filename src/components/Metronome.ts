import { Component, Engine } from "@niloc/ecs";
import { Tempo } from "../sound/Tempo";
import sound from "../assets/sounds/metronome-click.mp3"
import { SoundEngine } from "../resources/SoundEngine";
import type { TempoTrack } from "../sound/song/TempoTrack";

export class Metronome extends Component {

    static offsetSeconds = 0.09

    private _nextTick: number = 0
    private _buffer: AudioBuffer | null = null
    private _volume = 1.0
    private _tempoTrack: TempoTrack
    private _soundEngine: SoundEngine

    constructor(engine: Engine, tempoTrack: TempoTrack) {
        super(engine)
        this._tempoTrack = tempoTrack
        this._loadBuffer()
        this._soundEngine = this.engine.getResource(SoundEngine)
    }
    
    get volume() {
        return this._volume
    }

    set volume(value: number) {
        this._volume = value
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
        if (ticks >= this._nextTick) {
            // Shall schedule next click

            this._nextTick = ticks - (ticks % Tempo.PPQ) + Tempo.PPQ
            // convert in time
            const nextTickTime = this._tempoTrack.secondsFromTicks(this._nextTick)
            const currentTime = this._tempoTrack.secondsFromTicks(ticks)

            const clickTime = this._soundEngine.currentTime + (nextTickTime - currentTime) - Metronome.offsetSeconds
            this._click(clickTime)
        }
    }

    seekTicks(ticks: number) {
        this._nextTick = ticks - (ticks % Tempo.PPQ) + Tempo.PPQ
    }
    
    reset() {
        this._nextTick = 0
    }

    click() {
        this._click()
    }

    private _click(time?: number) {
        // Play click sound
        if (!this._buffer) 
            return
        
        const audioNode = this.engine.getResource(SoundEngine).createAudioBufferNode(this._buffer)
        const gain = this.engine.getResource(SoundEngine).createGainNode()
        gain.gain = this._volume
        audioNode.connect(gain)
        gain.connect(this.engine.getResource(SoundEngine).output)

        audioNode.play(time)
    }

}