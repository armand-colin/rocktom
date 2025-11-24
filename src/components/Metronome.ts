import { Component, Engine } from "@niloc/ecs";
import { Tempo } from "../sound/Tempo";
import sound from "../assets/sounds/metronome-click.mp3"
import { SoundEngine } from "../resources/SoundEngine";

export class Metronome extends Component {

    private _nextTick: number = Tempo.PPQ
    private _buffer: AudioBuffer | null = null
    private _volume = 1.0

    constructor(engine: Engine) {
        super(engine)
        this._loadBuffer()
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
            this._click()
            this._nextTick = ticks - (ticks % Tempo.PPQ) + Tempo.PPQ
        }
    }

    reset() {
        this._nextTick = Tempo.PPQ
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