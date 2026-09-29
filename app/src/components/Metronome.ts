import { Component, Engine } from "@niloc/ecs";
import { Tempo } from "../sound/Tempo";
import clickSound from "../assets/sounds/metronome-click.mp3"
import accentSound from "../assets/sounds/metronome-accent.mp3"
import { SoundEngine } from "../resources/SoundEngine";
import type { TempoTrack } from "../sound/song/TempoTrack";
import type { AudioBufferSoundNode } from "../sound/node/AudioBufferSoundNode";
import { Mixer } from "../resources/Mixer";

export class Metronome extends Component {

    static lookAheadSeconds = 0.5
    static beatsPerMeasure = 4

    private _tempoTrack: TempoTrack
    private _soundEngine: SoundEngine
    private _clickNode: AudioBufferSoundNode | null = null
    private _accentNode: AudioBufferSoundNode | null = null
    private _scheduledSources: AudioBufferSourceNode[] = []
    private _lastScheduledBeat = -1
    private _songAnchor = 0
    private _audioAnchor = 0
    private _speed = 1

    constructor(engine: Engine, tempoTrack: TempoTrack) {
        super(engine)
        this._tempoTrack = tempoTrack
        this._soundEngine = this.engine.getResource(SoundEngine)

        this._loadNode(clickSound, node => { this._clickNode = node })
        this._loadNode(accentSound, node => { this._accentNode = node })
    }

    sync(songSeconds: number, speed: number) {
        this._cancelScheduled()
        this._songAnchor = songSeconds
        this._audioAnchor = this._soundEngine.currentTime
        this._speed = speed
        this._lastScheduledBeat = -1
    }

    update(ticks: number, speed: number) {
        if (!this._clickNode || !this._accentNode)
            return

        if (speed !== this._speed)
            this.sync(this._tempoTrack.secondsFromTicks(ticks), speed)

        const currentSeconds = this._tempoTrack.secondsFromTicks(ticks)
        const lookAheadEnd = currentSeconds + Metronome.lookAheadSeconds
        const maxBeatTick = this._tempoTrack.ticksFromSeconds(lookAheadEnd)
        const minAudioTime = this._soundEngine.currentTime

        let beatTick = this._lastScheduledBeat >= 0
            ? this._lastScheduledBeat + Tempo.PPQ
            : ticks % Tempo.PPQ === 0
                ? ticks
                : ticks - (ticks % Tempo.PPQ) + Tempo.PPQ

        while (beatTick <= maxBeatTick) {
            const beatSeconds = this._tempoTrack.secondsFromTicks(beatTick)
            const audioWhen = this._audioAnchor + (beatSeconds - this._songAnchor) / this._speed
            const accent = this._isDownbeat(beatTick)

            if (audioWhen >= minAudioTime) {
                this._scheduleClick(audioWhen, accent)
                this._lastScheduledBeat = beatTick
            } else if (beatSeconds >= currentSeconds - Metronome.lookAheadSeconds) {
                this._scheduleClick(minAudioTime, accent)
                this._lastScheduledBeat = beatTick
            }

            beatTick += Tempo.PPQ
        }
    }

    pause() {
        this._cancelScheduled()
    }
    
    reset() {
        this._cancelScheduled()
        this._lastScheduledBeat = -1
        this._songAnchor = 0
        this._audioAnchor = this._soundEngine.currentTime
        this._speed = 1
    }

    click() {
        this._scheduleClick(this._soundEngine.currentTime, false)
    }

    destroy(): void {
        super.destroy()
        this._cancelScheduled()
        this._clickNode?.dispose()
        this._accentNode?.dispose()
    }

    private _isDownbeat(beatTick: number): boolean {
        const beatIndex = Math.round(beatTick / Tempo.PPQ)
        return beatIndex % Metronome.beatsPerMeasure === 0
    }

    private _scheduleClick(when: number, accent: boolean) {
        const node = accent ? this._accentNode : this._clickNode
        if (!node)
            return

        const source = node.playAt(when)
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

    private _loadNode(url: string, assign: (node: AudioBufferSoundNode) => void) {
        fetch(url)
            .then(response => response.arrayBuffer())
            .then(buffer => this._soundEngine.createAudioBuffer(buffer))
            .then(async audioBuffer => {
                const node = await this._soundEngine.createAudioBufferNode(audioBuffer)
                const mixer = this.engine.getResource(Mixer)
                mixer.metronome.connect(node)
                assign(node)
            })
    }

}
