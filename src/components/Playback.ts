import { Component, type Engine } from "@niloc/ecs";
import { NeckMesh } from "../3d/NeckMesh";
import { Renderer } from "../resources/Renderer";
import { YoutubePlayer } from "../resources/YoutubePlayer";
import { Bass } from "../sound/instrument/Instrument";
import { type Level } from "../sound/Level";
import { LevelReader } from "../sound/LevelReader";
import { PlaybackNote } from "./PlaybackNote";

export class Playback extends Component {

    private _time: number = 0
    private _notes: PlaybackNote[] = []
    private _youtubePlayer: YoutubePlayer
    private _reader: LevelReader

    constructor(
        engine: Engine,
        readonly level: Level,
    ) {
        super(engine)

        this._reader = new LevelReader(level)

        this._youtubePlayer = this.engine.getResource(YoutubePlayer)
        const audioTrack = level.audioTrack
        this._youtubePlayer.load(audioTrack.youtubeVideoId)

        const instrument = new Bass()
        const neck = NeckMesh.create(instrument)
        const renderer = engine.getResource(Renderer)
        renderer.add(neck)

        this._notes = level.bassTrack.notes.map(note => {
            return this.engine.createComponent(PlaybackNote, instrument, note)
        })
    }

    get ticksPerSecond() {
        return this.level.timing.ticksPerSecond
    }

    update(deltaTime: number) {
        if (deltaTime === 0)
            return

        for (const noteEvent of this._reader.update(deltaTime)) {
            // Shall handle notes
            // console.log("Should handle", noteEvent)
        }

        if (
            this.level.audioTrack.startTime > this._time &&
            this.level.audioTrack.startTime <= this._time + deltaTime
        ) {
            this._youtubePlayer.play()
        }

        this._time += deltaTime

        const ticks = this.level.timing.seconds(this._time)
        for (const note of this._notes)
            note.update(ticks)
    }

    pause() {
        this._youtubePlayer.pause()
    }

    reset() {
        this._time = 0
        this._youtubePlayer.seek(0)
        this._reader.reset()
    }

}