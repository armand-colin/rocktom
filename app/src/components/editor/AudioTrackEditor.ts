import { Component, Engine } from "@niloc/ecs";
import { type AudioTrack } from "../../sound/song/AudioTrack";
import { AudioData } from "../../core/AudioData";
import type { DocumentEntity } from "../../queries/document/DocumentEntity";
import { DocumentQueries } from "../../queries/document/DocumentQueries";
import type { AudioWaveformRenderer } from "./AudioWaveformRenderer";

export class AudioTrackEditor extends Component {

    readonly track: AudioTrack
    readonly levelId: string

    private _playback: DocumentEntity | null = null
    private _audioData: AudioData | null = null
    
    readonly audioWaveformRenderer: AudioWaveformRenderer

    constructor(engine: Engine, levelId: string, track: AudioTrack) {
        super(engine)
        this.track = track
        this.levelId = levelId

        if (track.playbackId) {
            console.log('setting track change')
            this._onTrackChange()
        }
    }

    get audioData() {
        return this._audioData?.id ?? null
    }

    private _onTrackChange = () => {
        console.log('on track change', this.track.playbackId)

        const playbackId = this.track.playbackId

        if (this._playback && this._playback.id === playbackId) {
            return
        }

        if (!playbackId) {
            this._playback = null
            this._audioData = null
            this.changed()
            return
        }

        console.log('getting playback', playbackId) 
    
        DocumentQueries.get(playbackId)
            .then(result => {
                if (!result.ok) {
                    // TODO: handle error
                    return
                }

                console.log('got playback', result.value)

                this._playback = result.value
                this.changed()
                this._generateAudioData()
            })
    }

    async setPlayback(playback: DocumentEntity | null) {
        // Bind playback to level
        this._playback = playback
        this.track.playbackId = playback?.id ?? null
        this._generateAudioData()
        this.changed()
    }

    private _generateAudioData() {
        this._audioData = null

        if (!this._playback) {
            return
        }

        AudioData.fetch(this.engine, this._playback.id)
            .then(data => {
                console.log('fetched audioData', data)
                this._audioData = data
                this.changed()
            })
            .catch(e => console.error('Error fetching audioData', e))
    }

    setTime(time: number) {
        this.track.time = time
        this.changed()
    }

}