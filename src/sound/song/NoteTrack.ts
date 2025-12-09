import { nanoid } from "nanoid";
import { Instrument, type InstrumentType } from "../instrument/Instrument";
import { Tempo } from "../Tempo";
import type { FocusTrackBuilder } from "./FocusTrack";
import type { Marker } from "./Marker";
import { Pattern, TimedPattern, type SerializedPattern } from "./Pattern";
import type { TempoTrack } from "./TempoTrack";


export type SerializedNoteTrack = {
    instrument: InstrumentType,
    patterns: SerializedPattern[],
    timedPatterns: { id: string, patternId: string, ticks: number }[],
    markers: Marker[]
}

export class NoteTrack {

    readonly instrument: Instrument
    readonly timedPatterns: TimedPattern[] = []
    readonly markers: Marker[] = []
    readonly patterns = new Map<string, Pattern>()

    constructor(
        instrument: Instrument,
        patterns: TimedPattern[],
        markers: Marker[]
    ) {
        this.instrument = instrument
        this.timedPatterns = patterns
        this.markers = markers

        for (const { pattern } of patterns)
            this.patterns.set(pattern.id, pattern)
    }

    get lastNote() {
        const lastPattern = this.timedPatterns[this.timedPatterns.length - 1]
        if (!lastPattern)
            return null

        const lastNoteInPattern = lastPattern.pattern.notes[lastPattern.pattern.notes.length - 1]
        if (!lastNoteInPattern)
            return null

        return {
            ...lastNoteInPattern,
            time: lastNoteInPattern.time + lastPattern.time
        }
    }

    *notes() {
        for (const { time, pattern } of this.timedPatterns) {
            for (const note of pattern.notes) {
                yield {
                    ...note,
                    time: note.time + time
                }
            }
        }
    }

    addTimedPattern(timedPattern: TimedPattern) {
        // Array is sorted, so sorted insert
        let insertIndex = this.timedPatterns.findIndex(tp => tp.time > timedPattern.time)

        if (insertIndex === -1)
            insertIndex = this.timedPatterns.length

        this.timedPatterns.splice(insertIndex, 0, timedPattern)
    }

    removeTimedPattern(id: string): boolean {
        const index = this.timedPatterns.findIndex(tp => tp.id === id)
        if (index === -1)
            return false
        this.timedPatterns.splice(index, 1)
        return true
    }

    serialize(): SerializedNoteTrack {
        return {
            instrument: this.instrument.type,
            patterns: Array.from(this.patterns.values()).map(p => p.serialize()),
            markers: this.markers,
            timedPatterns: this.timedPatterns.map(tp => ({
                id: tp.id,
                patternId: tp.pattern.id,
                ticks: tp.time
            }))
        }
    }

    static deserialize(data: SerializedNoteTrack): NoteTrack {
        const patternsMap = new Map<string, Pattern>()
        for (const patternData of data.patterns) {
            const pattern = Pattern.deserialize(patternData)
            patternsMap.set(pattern.id, pattern)
        }

        const timedPatterns: TimedPattern[] = data.timedPatterns.map(tpData => {
            const pattern = patternsMap.get(tpData.patternId)
            if (!pattern)
                throw new Error(`Pattern with id ${tpData.patternId} not found`)

            return new TimedPattern({
                id: tpData.id,
                time: tpData.ticks,
                pattern: pattern
            })
        })

        return new NoteTrack(
            Instrument.fromType(data.instrument),
            timedPatterns,
            data.markers
        )
    }

}

export class NoteTrackBuilder {

    private _time: number = 0
    private _patterns: TimedPattern[] = []
    private _instrument: Instrument
    private _markers: Marker[] = []

    constructor(instrument: Instrument) {
        this._instrument = instrument
    }

    silence(ticks: number): this {
        this._time += ticks
        return this
    }

    get time() {
        return this._time
    }

    pattern(pattern: Pattern): this {
        this._patterns.push(new TimedPattern({
            id: nanoid(),
            time: this._time,
            pattern: pattern,
            duration: pattern.duration
        }))

        this._time += pattern.duration
        return this
    }

    build(): NoteTrack {
        return new NoteTrack(
            this._instrument,
            this._patterns,
            this._markers
        )
    }

    marker(name: string): this {
        this._markers.push({
            id: nanoid(),
            time: this._time,
            name: name
        })
        return this
    }

    addFocus(focus: [number, number], track: FocusTrackBuilder, duration: number, forward: boolean = false): this {
        if (forward) {
            track.add(this._time, duration, focus)
        } else {
            track.add(this._time - duration, duration, focus)
        }

        return this
    }

    addTempo(tempo: Tempo, tempoTrack: TempoTrack): this {
        tempoTrack.add(this._time, tempo)
        return this
    }

}