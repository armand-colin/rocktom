import { Component, Engine } from "@niloc/ecs";
import { Tempo } from "../sound/Tempo";
import sound from "../assets/sounds/metronome-click.mp3"
import { SoundEngine } from "../resources/SoundEngine";
import type { TempoTrack } from "../sound/song/TempoTrack";
import type { AudioElementSoundNode } from "../sound/node/AudioElementSoundNode";
import { Mixer } from "../resources/Mixer";

export class Metronome extends Component {

    // Offset from the audio sample
    static offsetSeconds = 0.04

    private _tempoTrack: TempoTrack
    private _soundEngine: SoundEngine

    private _audio: HTMLAudioElement
    private _node: AudioElementSoundNode

    constructor(engine: Engine, tempoTrack: TempoTrack) {
        super(engine)
        this._tempoTrack = tempoTrack

        this._audio = new Audio(sound)
        this._soundEngine = this.engine.getResource(SoundEngine)

        this._node = this._soundEngine.createAudioElementNode(this._audio)
        const mixer = this.engine.getResource(Mixer)
        mixer.metronome.connect(this._node)
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
        this._audio.pause()
    }
}