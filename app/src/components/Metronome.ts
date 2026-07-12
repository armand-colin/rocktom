import { Component, Engine } from "@niloc/ecs";
import { Tempo } from "../sound/Tempo";
import sound from "../assets/sounds/metronome-click.mp3"
import { SoundEngine } from "../resources/SoundEngine";
import type { TempoTrack } from "../sound/song/TempoTrack";
import type { AudioBufferSoundNode } from "../sound/node/AudioBufferSoundNode";
import { Mixer } from "../resources/Mixer";

export class Metronome extends Component {

    static lookAheadSeconds = 0.5

    private _tempoTrack: TempoTrack
    private _soundEngine: SoundEngine
    private _node: AudioBufferSoundNode | null = null
    private _scheduledSources: AudioBufferSourceNode[] = []
    private _lastScheduledBeat = -1
    private _songAnchor = 0
    private _audioAnchor = 0
    private _speed = 1

    constructor(engine: Engine, tempoTrack: TempoTrack) {
        super(engine)
        this._tempoTrack = tempoTrack
        this._soundEngine = this.engine.getResource(SoundEngine)

        fetch(sound)
            .then(response => response.arrayBuffer())
            .then(buffer => this._soundEngine.createAudioBuffer(buffer))
            .then(audioBuffer => {
                this._node = this._soundEngine.createAudioBufferNode(audioBuffer)
                const mixer = this.engine.getResource(Mixer)
                mixer.metronome.connect(this._node)
            })
    }

    sync(songSeconds: number, speed: number) {
        this._cancelScheduled()
        this._songAnchor = songSeconds
        this._audioAnchor = this._soundEngine.currentTime
        this._speed = speed
        this._lastScheduledBeat = -1
    }

    update(ticks: number, speed: number) {
        if (!this._node)
            return

        if (speed !== this._speed)
            this.sync(this._tempoTrack.secondsFromTicks(ticks), speed)

        const currentSeconds = this._tempoTrack.secondsFromTicks(ticks)
        const lookAheadEnd = currentSeconds + Metronome.lookAheadSeconds
        const maxBeatTick = this._tempoTrack.ticksFromSeconds(lookAheadEnd)
        const minAudioTime = this._soundEngine.currentTime

        let beatTick = this._lastScheduledBeat >= 0
            ? this._lastScheduledBeat + Tempo.PPQ
            : ticks - (ticks % Tempo.PPQ) + Tempo.PPQ

        while (beatTick <= maxBeatTick) {
            const beatSeconds = this._tempoTrack.secondsFromTicks(beatTick)
            const audioWhen = this._audioAnchor + (beatSeconds - this._songAnchor) / this._speed

            if (audioWhen >= minAudioTime) {
                this._scheduleClick(audioWhen)
                this._lastScheduledBeat = beatTick
            } else if (beatSeconds >= currentSeconds - Metronome.lookAheadSeconds) {
                this._scheduleClick(minAudioTime)
                this._lastScheduledBeat = beatTick
            }

            beatTick += Tempo.PPQ
        }
    }

    reset() {
        this._cancelScheduled()
        this._lastScheduledBeat = -1
        this._songAnchor = 0
        this._audioAnchor = this._soundEngine.currentTime
        this._speed = 1
    }

    click() {
        if (!this._node)
            return

        this._scheduleClick(this._soundEngine.currentTime)
    }

    destroy(): void {
        super.destroy()
        this._cancelScheduled()
        this._node?.disconnect()
    }

    private _scheduleClick(when: number) {
        const source = this._node!.playAt(when)
        this._scheduledSources.push(source)
        source.onended = () => {
            source.disconnect()
            const index = this._scheduledSources.indexOf(source)
            if (index !== -1)
                this._scheduledSources.splice(index, 1)
        }
    }

    private _cancelScheduled() {
        for (const source of this._scheduledSources) {
            try {
                source.stop()
            } catch {
                // already stopped
            }
            source.disconnect()
        }
        this._scheduledSources = []
    }

}
