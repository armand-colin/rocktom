import { Component, type Engine } from "@niloc/ecs";
import { Duration } from "@niloc/utils";
import { NeckMesh } from "../3d/NeckMesh";
import { PlaybackPreferences } from "../resources/PlaybackPreferences";
import { Renderer } from "../resources/Renderer";
import { YoutubePlayer } from "../resources/YoutubePlayer";
import { Bass } from "../sound/instrument/Instrument";
import { type Level } from "../sound/Level";
import { CameraRig } from "./CameraRig";
import { PlaybackNote } from "./PlaybackNote";
import { Metronome } from "./Metronome";
import { PlaybackTime } from "./PlaybackTime";
import type { AudioPlayer } from "../core/AudioPlayer";
import { AudioType } from "../sound/song/AudioTrack";
import { UrlAudioPlayer } from "./UrlAudioPlayer";
import { PlayingNotes3D } from "../3d/PlayingNotes3D";

export class Playback extends Component {

    private _time: number = 0
    private _notes: PlaybackNote[] = []
    private _playingNotes: PlayingNotes3D

    private _rig: CameraRig
    private _metronome: Metronome
    private _speed = 1.0
    private _metronomeVolume = 0.2
    private _metronomeEnabled = false
    private _playing = false
    private _renderer: Renderer
    private _loading = true

    readonly playbackTime: PlaybackTime
    private _window: NoteWindow

    private _audioPlayerVolume: number = 1.0
    private _audioPlayer: AudioPlayer

    constructor(
        engine: Engine,
        readonly level: Level,
    ) {
        super(engine)

        const preferences = engine.getResource(PlaybackPreferences)

        const payload = level.audioTrack.payload
        if (payload.type === AudioType.YouTube) {
            const player = engine.getResource(YoutubePlayer)
            player.load(payload.youtubeVideoId)
                .then(() => {
                    this._loading = false
                    this.changed()
                })
            this._audioPlayer = player
        } else {
            const urlPlayer = engine.createComponent(UrlAudioPlayer, payload.url)
            this._audioPlayer = urlPlayer
            if (urlPlayer.loaded)
                this._loading = false
            else
                urlPlayer.events.on('loaded', () => {
                    this._loading = false
                    this.changed()
                })
        }

        this._audioPlayerVolume = preferences.audioVolume
        this._audioPlayer.setVolume(this._audioPlayerVolume)

        this.playbackTime = engine.createComponent(PlaybackTime, level.tempoTrack.getTempoAt(0))

        this._rig = engine.createComponent(CameraRig, engine.getResource(Renderer).camera)
        this._metronome = engine.createComponent(Metronome, level.tempoTrack)


        this._renderer = engine.getResource(Renderer)

        const instrument = new Bass()
        const neck = NeckMesh.create(instrument)
        this._renderer.add(neck)

        this._playingNotes = new PlayingNotes3D()
        this._renderer.add(this._playingNotes)

        this._notes = []

        for (const note of level.bassTrack.notes())
            this._notes.push(this.engine.createComponent(PlaybackNote, instrument, note))

        this._window = new NoteWindow(this._notes, this._renderer)
        this._updateWindow()

        this._rig.focus(level.focusTrack.initialFocus)

        Object.assign(window, { playback: this })
    }

    get loading() {
        return this._loading
    }

    private _getTimeWindow() {
        let minTime = this._time - 2.0
        let maxTime = this._time + 10.0

        minTime = this.level.tempoTrack.ticksFromSeconds(minTime)
        maxTime = this.level.tempoTrack.ticksFromSeconds(maxTime)

        return { minTime, maxTime }
    }

    private _updateWindow() {
        const { minTime, maxTime } = this._getTimeWindow()
        const ticks = this.level.tempoTrack.ticksFromSeconds(this._time)

        this._window.update(ticks, minTime, maxTime)
    }

    get speed() {
        return this._speed
    }

    set speed(value: number) {
        this._speed = value
        this._audioPlayer.setSpeed(value)
        this.changed()
    }

    get audioVolume() {
        return this._audioPlayerVolume
    }

    set audioVolume(value: number) {
        this._audioPlayerVolume = value
        this.engine.getResource(PlaybackPreferences).audioVolume = value
        this._audioPlayer.setVolume(value)
        this.changed()
    }

    get metronomeVolume() {
        return this._metronomeVolume
    }

    set metronomeVolume(value: number) {
        this._metronomeVolume = value
        this._metronome.volume = value
        this.changed()
    }

    get metronomeEnabled() {
        return this._metronomeEnabled
    }

    set metronomeEnabled(value: boolean) {
        this._metronomeEnabled = value
        this.changed()
    }

    destroy() {
        for (const note of this._notes)
            note.destroy()

        this._window.clear()
        this._audioPlayer.clear()
        this._rig.destroy()
        this._renderer.remove(this._playingNotes)
    }

    seekTicks(ticks: number) {
        this._time = this.level.tempoTrack.secondsFromTicks(ticks)
        this._updateWindow()

        // Find correct focus event
        const focusEvent = this.level.focusTrack.getEventAtTicks(ticks)
        if (!focusEvent) {
            this._rig.focus(this.level.focusTrack.initialFocus)
        } else {
            this._rig.transition(focusEvent.focus, focusEvent.time, focusEvent.duration)
        }
        this._rig.update(ticks)

        this.playbackTime.set(this._time, ticks, this.level.tempoTrack.getTempoAt(ticks))
        const audioSeekTime = Math.max(0, this._time - this.level.audioTrack.startTime)
        this._audioPlayer.seek(audioSeekTime)
        this._metronome.seekTicks(ticks)
        this._playingNotes.update(ticks)
    }

    update(deltaTime: number) {
        if (this.level.audioTrack.startTime <= this._time) {
            // Try to compensate for audio latency
            const audioDeltaTime = this._time - this._audioPlayer.getTime() - this.level.audioTrack.startTime
            deltaTime -= audioDeltaTime / 24
            Object.assign(window, { latency: audioDeltaTime })
        }

        deltaTime = deltaTime * this._speed

        const beforeTicks = this.level.tempoTrack.ticksFromSeconds(this._time)
        this._time += deltaTime

        const ticks = this.level.tempoTrack.ticksFromSeconds(this._time)

        if (this._metronomeEnabled)
            this._metronome.update(ticks, this._speed)

        this._updateWindow()
        for (const { note } of this._window.iter()) {
            if (note.time >= beforeTicks && note.time < ticks) {
                this._playingNotes.play(note)
            }
        }

        const focusEvent = this.level.focusTrack.getEventBetweenTicks(beforeTicks, ticks)

        if (focusEvent)
            this._rig.transition(focusEvent.focus, focusEvent.time, focusEvent.duration)

        this._rig.update(ticks)
        this._playingNotes.update(ticks)

        this.playbackTime.set(this._time, ticks, this.level.tempoTrack.getTempoAt(ticks))
    }

    play() {
        if (this._playing)
            return

        this._playing = true
        if (this._time >= this.level.audioTrack.startTime)
            this._audioPlayer.play()
        else
            this._audioPlayer.schedulePlay(Duration.fromSeconds(this.level.audioTrack.startTime - this._time))
    }

    pause() {
        this._audioPlayer.pause()
        this._playing = false
    }

    reset() {
        this._time = 0
        this.playbackTime.set(0, 0, this.level.tempoTrack.getTempoAt(0))
        this._audioPlayer.clearScheduledPlay()
        this._audioPlayer.pause()
        this._audioPlayer.seek(0)
        this._rig.focus(this.level.focusTrack.initialFocus)
        this._rig.update(0)
        this._playingNotes.update(0)
        this._metronome.reset()

        this._updateWindow()

        if (this._playing)
            this._audioPlayer.schedulePlay(Duration.fromSeconds(this.level.audioTrack.startTime))
    }

}


class Node {

    next: Node | null = null
    prev: Node | null = null

    constructor(
        readonly index: number,
        readonly note: PlaybackNote
    ) { }

}

class LinkedList {

    private _size: number = 0

    head: Node | null = null
    tail: Node | null = null

    get size() {
        return this._size
    }

    pop(node: Node) {
        if (node.next)
            node.next.prev = node.prev

        if (node.prev)
            node.prev.next = node.next

        if (node === this.head)
            this.head = node.next

        if (node === this.tail)
            this.tail = node.prev

        this._size--
    }

    push(node: Node) {
        if (!this.head) {
            this.head = node
            this.tail = node
        } else {
            node.prev = this.tail

            if (this.tail)
                this.tail.next = node

            this.tail = node
        }

        this._size++
    }

    unshift(node: Node) {
        if (!this.head) {
            this.head = node
            this.tail = node
        } else {
            node.next = this.head
            this.head.prev = node
            this.head = node
        }

        this._size++
    }

    *iter() {
        let node = this.head
        while (node) {
            yield node.note
            node = node.next
        }
    }

}

class NoteWindow {

    private _current = new LinkedList()

    constructor(
        readonly notes: PlaybackNote[],
        readonly renderer: Renderer
    ) { }

    iter() {
        return this._current.iter()
    }

    update(ticks: number, minTicks: number, maxTicks: number) {
        this._prune(minTicks, maxTicks)

        if (this._current.size === 0) {
            // Shall find first note to add
            for (let i = 0; i < this.notes.length; i++) {
                const note = this.notes[i]
                if (note.note.time + note.note.duration <= minTicks)
                    continue

                if (note.note.time + note.note.duration > maxTicks)
                    return

                const node = new Node(i, note)
                this._current.push(node)
                this.renderer.add(note.object)
                break
            }

            this._increaseForwards(maxTicks)
        } else {
            this._increaseForwards(maxTicks)
            this._increaseBackwards(minTicks)
        }

        for (const note of this._current.iter()) {
            note.update(ticks)
        }
    }

    clear() {
        for (const note of this._current.iter())
            this.renderer.remove(note.object)

        this._current = new LinkedList()
    }

    private _prune(minTicks: number, maxTicks: number) {
        let node = this._current.head
        while (node) {
            const note = node.note
            if (note.note.time < minTicks || note.note.time + note.note.duration > maxTicks) {
                const nextNode = node.next
                this._current.pop(node)
                node = nextNode
                this.renderer.remove(note.object)
                continue
            }
            node = node.next
        }
    }

    private _increaseForwards(maxTicks: number) {
        if (!this._current.tail)
            return

        let index = this._current.tail.index + 1

        while (index < this.notes.length) {
            const note = this.notes[index]
            if (note.note.time > maxTicks)
                return

            const newNode = new Node(index, note)
            this._current.push(newNode)
            this.renderer.add(note.object)

            index++
        }
    }

    private _increaseBackwards(minTicks: number) {
        if (!this._current.head)
            return

        let index = this._current.head.index - 1

        while (index >= 0) {
            const note = this.notes[index]
            if (note.note.time + note.note.duration < minTicks)
                return

            const newNode = new Node(index, note)
            this._current.unshift(newNode)
            this.renderer.add(note.object)

            index--
        }
    }

}