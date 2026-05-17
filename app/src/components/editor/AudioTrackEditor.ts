import { Component, Engine } from "@niloc/ecs";
import { type AudioTrack } from "../../sound/song/AudioTrack";
import { AudioData } from "../../core/AudioData";
import type { DocumentEntity } from "../../queries/document/DocumentEntity";
import { DocumentQueries } from "../../queries/document/DocumentQueries";
import { LevelQueries } from "../../queries/level/LevelQueries";

export class AudioTrackEditor extends Component {

    readonly track: AudioTrack
    readonly levelId: string

    private _playback: DocumentEntity | null = null
    private _audioData: AudioData | null = null

    constructor(engine: Engine, levelId: string, track: AudioTrack) {
        super(engine)
        this.track = track
        this.levelId = levelId

        if (track.playbackId) {
            this._onTrackChange()
        }
    }

    get audioData() {
        return this._audioData?.id ?? null
    }

    private _onTrackChange = () => {
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

        DocumentQueries.get(playbackId)
            .then(result => {
                if (!result.ok) {
                    // TODO: handle error
                    return
                }

                this._playback = result.value
                this.changed()

                this._generateAudioData()
            })
    }

    async setPlayback(playback: DocumentEntity | null) {
        // Bind playback to level

        const result = await LevelQueries.setPlayback(this.levelId, playback?.id ?? null)

        if (!result.ok) {
            // TODO: handle error
            return
        }

        this._playback = playback
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