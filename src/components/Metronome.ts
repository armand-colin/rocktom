import { Component, Engine } from "@niloc/ecs";
import { Tempo } from "../sound/Tempo";
import sound from "../assets/sounds/metronome-click.mp3"
import { SoundEngine } from "../resources/SoundEngine";
import type { TempoTrack } from "../sound/song/TempoTrack";
import type { AudioElementSoundNode } from "../sound/node/AudioElementSoundNode";
import type { GainSoundNode } from "../sound/node/GainSoundNode";

export class Metronome extends Component {

    // Offset from the audio sample
    static offsetSeconds = 0.04

    private _volume = 1.0
    private _tempoTrack: TempoTrack
    private _soundEngine: SoundEngine

    private _audio: HTMLAudioElement
    private _node: AudioElementSoundNode
    private _gain: GainSoundNode


    constructor(engine: Engine, tempoTrack: TempoTrack) {
        super(engine)
        this._tempoTrack = tempoTrack

        this._audio = new Audio(sound)

        this._soundEngine = this.engine.getResource(SoundEngine)

        this._node = this._soundEngine.createAudioElementNode(this._audio)
        this._gain = this._soundEngine.createGainNode()
        this._node.connect(this._gain)
        this._gain.connect(this._soundEngine.output)
    }

    get volume() {
        return this._volume
    }

    set volume(value: number) {
        this._volume = value
        this._gain.gain = value
    }

    update(ticks: number, speed: number) {
        // Shall schedule next click
        const nextClick = ticks - (ticks % Tempo.PPQ) + Tempo.PPQ

        // convert in time
        const nextTickTime = this._tempoTrack.secondsFromTicks(nextClick)
        const currentTime = this._tempoTrack.secondsFromTicks(ticks)

        const deltaTime = (nextTickTime - currentTime) / speed

        if (deltaTime <= Metronome.offsetSeconds) {
            // Play immediately
            this._click()
        }
    }

    reset() {
        this._audio.pause()
        this._audio.currentTime = 0
    }

    click() {
        this._click()
    }

    private _click() {
        // Play click sound
        this._audio.currentTime = 0
        this._audio.play()
    }

    destroy(): void {
        super.destroy()
        this._node.disconnect()
        this._gain.disconnect()
        this._audio.pause()
    }
}