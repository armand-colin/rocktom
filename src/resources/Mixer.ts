import { Engine, Resource } from "@niloc/ecs";
import { Component } from "@niloc/ecs"
import { SoundEngine } from "./SoundEngine";
import type { GainSoundNode } from "../sound/node/GainSoundNode";
import type { SoundNode } from "../sound/node/SoundNode";

export class MixerChannel extends Component {

    private _enabled: boolean = true
    private _volume: number = 1.0
    private _gain: GainSoundNode

    readonly channelId: string
    readonly name: string
    readonly maxVolume: number

    constructor(engine: Engine, channelId: string, name: string, maxVolume: number = 1.0) {
        super(engine)
        const soundEngine = engine.getResource(SoundEngine)
        this._gain = soundEngine.createGainNode()
        this.channelId = channelId
        this.name = name
        this.maxVolume = maxVolume
        this._recover()
    }

    private _save() {
        const prefix = Mixer.storagePrefix + "_" + this.channelId
        localStorage.setItem(prefix + "_enabled", this._enabled ? "1" : "0")
        localStorage.setItem(prefix + "_volume", this._volume.toString())
    }

    private _recover() {
        const prefix = Mixer.storagePrefix + "_" + this.channelId
        const enabledStr = localStorage.getItem(prefix + "_enabled")
        if (enabledStr !== null) {
            this._enabled = enabledStr === "1"
        }

        const volumeStr = localStorage.getItem(prefix + "_volume")
        if (volumeStr !== null) {
            const volume = parseFloat(volumeStr)
            if (!isNaN(volume)) {
                this._volume = volume
            }
        }

        this._gain.gain = this._enabled ? this._volume : 0.0
    }

    get volume() {
        return this._volume
    }

    setVolume(value: number) {
        value = Math.min(Math.max(0.0, value), this.maxVolume)
        this._volume = value
        this._gain.gain = this._enabled ? value : 0.0
        this._save()
        this.changed()
    }

    get enabled() {
        return this._enabled
    }

    get node() {
        return this._gain
    }

    setEnabled(value: boolean) {
        this._enabled = value
        this._gain.gain = this._enabled ? this._volume : 0.0
        this._save()
        this.changed()
    }

    toggleEnabled() {
        this.setEnabled(!this._enabled)
    }

    connect(node: SoundNode) {
        node.connect(this._gain)
    }

}

export class Mixer extends Resource {

    readonly master: MixerChannel
    readonly feedback: MixerChannel
    readonly metronome: MixerChannel
    readonly audio: MixerChannel

    static storagePrefix = "Mixer"

    constructor(engine: Engine) {
        super(engine)

        this.master = engine.createComponent(MixerChannel, "master", "Master")

        this.feedback = engine.createComponent(MixerChannel, "instrument", "Instrument", 100)
        this.metronome = engine.createComponent(MixerChannel, "metronome", "Metronome")
        this.audio = engine.createComponent(MixerChannel, "audio", "Audio")

        this.master.connect(this.feedback.node)
        this.master.connect(this.metronome.node)
        this.master.connect(this.audio.node)

        this.master.node.connect(engine.getResource(SoundEngine).output)
    }

}