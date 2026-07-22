    import { Component, Engine } from "@niloc/ecs";
import { nanoid } from "nanoid";
import type { Marker } from "../../sound/song/Marker";
import type { NoteTrack } from "../../sound/song/NoteTrack";
import { Pattern, TimedPattern } from "../../sound/song/Pattern";
import { Tempo } from "../../sound/Tempo";
import type { VirtualBass } from "../VirtualBass";

export class NoteTrackEditor extends Component {

    readonly track: NoteTrack
    readonly virtualBass: VirtualBass

    private _pattern: Pattern | null
    private _lastDuration: number = 0

    private _patterns: Pattern[] = []

    constructor(engine: Engine, track: NoteTrack, virtualBass: VirtualBass) {
        super(engine)
        this.track = track
        this.virtualBass = virtualBass

        this._patterns = Array.from(track.patterns.values())
        this._pattern = this._patterns[0] || null
    }

    get pattern() {
        return this._pattern
    }

    get patterns() {
        return Array.from(this.track.patterns.values())
    }

    setPattern(pattern: Pattern) {
        this._pattern = pattern
        this.changed()
    }

    createPattern(name?:string): Pattern {
        const pattern = new Pattern({
            name: name || "New Pattern",
            instrument: this.track.instrument,
            notes: [],
        })

        this.track.patterns.set(pattern.id, pattern)
        this._pattern = pattern
        this._patterns.push(pattern)
        this.changed()

        return pattern
    }

    selectTimedPattern(timedPattern: TimedPattern) {
        this._pattern = timedPattern.pattern
        this._lastDuration = timedPattern.duration
        this.changed()
    }

    selectPattern(pattern: Pattern) {
        this._pattern = pattern
        this._lastDuration = 0
        this.changed()
    }
    
    addTimedPattern(ticks: number) {
        if (!this._pattern)
            return

        let duration = this._pattern.duration
        if (this._pattern.duration === 0)
            duration = Tempo.bars(1)

        this.track.addTimedPattern(new TimedPattern({
            time: ticks,
            pattern: this._pattern,
            duration: this._lastDuration || duration,
        }))

        this.changed()
    }

    removeTimedPattern(id: string) {
        if (this.track.removeTimedPattern(id))
            this.changed()
    }

    setTimedPatternDuration(id: string, duration: number) {
        for (const tp of this.track.timedPatterns) {
            if (tp.id !== id)
                continue
            tp.duration = duration
            this._pattern = tp.pattern
            this._lastDuration = duration
            this.changed()
            return
        }
    }

    setTimedPatternTime(id: string, time: number) {
        for (const tp of this.track.timedPatterns) {
            if (tp.id !== id)
                continue
            tp.time = time
            this._pattern = tp.pattern
            this._lastDuration = tp.duration
            this.changed()
            return
        }
    }

    setTimedPatternStartTime(id: string, leftEdgeTicks: number) {
        for (const tp of this.track.timedPatterns) {
            if (tp.id !== id)
                continue

            const visualLeft = tp.time + tp.offset
            const delta = leftEdgeTicks - visualLeft

            if (delta >= 0) {
                tp.offset += delta
                tp.duration = Math.max(0, tp.duration - delta)
            } else {
                const extend = -delta
                const offsetReduction = Math.min(tp.offset, extend)
                tp.offset -= offsetReduction
                tp.time = Math.max(0, tp.time - (extend - offsetReduction))
                tp.duration += extend
            }

            this._pattern = tp.pattern
            this._lastDuration = tp.duration
            this.changed()
            return
        }
    }

    addMarker(ticks: number) {
        const marker: Marker = {
            id: nanoid(),
            time: ticks,
            name: "New marker"
        }

        this.track.markers.push(marker)
        this._sortMarkers()
        this.changed()
    }

    setMarkerTime(id: string, time: number) {
        if (time < 0)
            return

        const index = this.track.markers.findIndex(marker => marker.id === id)
        if (index === -1)
            return

        const prevMarker = index > 0 ? this.track.markers[index - 1] : null
        const nextMarker = index < this.track.markers.length - 1 ? this.track.markers[index + 1] : null

        if (prevMarker && time <= prevMarker.time)
            return

        if (nextMarker && time >= nextMarker.time)
            return

        this.track.markers[index].time = time
        this._sortMarkers()
        this.changed()
    }

    setMarkerName(id: string, name: string) {
        const marker = this.track.markers.find(marker => marker.id === id)
        if (!marker)
            return

        marker.name = name
        this.changed()
    }

    removeMarker(id: string) {
        const index = this.track.markers.findIndex(marker => marker.id === id)
        if (index === -1)
            return

        this.track.markers.splice(index, 1)
        this.changed()
    }

    private _sortMarkers() {
        this.track.markers.sort((a, b) => a.time - b.time)
    }

}