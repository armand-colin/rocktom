import { Component, Engine } from "@niloc/ecs";
import { Tempo } from "../sound/Tempo";
import sound from "../assets/sounds/metronome-click.mp3"

export class Metronome extends Component {

    private _nextTick: number = Tempo.PPQ
    private _audio: HTMLAudioElement

    constructor(engine: Engine) {
        super(engine)
        this._audio = new Audio(sound)
        this._audio.volume = 0.2
    }
    
    get volume() {
        return this._audio.volume
    }
    
    set volume(value: number) { 
        this._audio.volume = value
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
        this._audio.currentTime = 0
        this._audio.play()
    }

}