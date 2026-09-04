import { nanoid } from "nanoid";
import { Instrument, InstrumentTuning, type InstrumentType } from "../instrument/Instrument";
import { Tempo } from "../Tempo";
import type { FocusTrackBuilder } from "./FocusTrack";
import type { Marker } from "./Marker";
import { Pattern, TimedPattern, type SerializedPattern, type SerializedTimedPattern } from "./Pattern";
import type { TempoTrack } from "./TempoTrack";


export type SerializedNoteTrack = {
    instrumentType: InstrumentType,
    instrumentTuning: InstrumentTuning,
    patterns: SerializedPattern[],
    timedPatterns: SerializedTimedPattern[],
    markers: Marker[]
}

export class NoteTrack {

    private _instrument: Instrument
    readonly timedPatterns: TimedPattern[] = []
    readonly markers: Marker[] = []
    readonly patterns = new Map<string, Pattern>()

    constructor(
        instrument: Instrument,
        timedPatterns: TimedPattern[],
        markers: Marker[],
        patterns?: Map<string, Pattern>
    ) {
        this._instrument = instrument
        this.timedPatterns = timedPatterns
        this.markers = markers

        if (patterns) {
            for (const [id, pattern] of patterns)
                this.patterns.set(id, pattern)
        }

        for (const { pattern } of timedPatterns)
            this.patterns.set(pattern.id, pattern)
    }

    get instrument() {
        return this._instrument
    }

    setInstrument(instrument: Instrument) {
        if (instrument.id === this._instrument.id) {
            return
        }

        this._instrument = instrument

        for (const pattern of this.patterns.values()) {
            pattern.setInstrument(instrument)
        }
    }

    clone(): NoteTrack {
        const patterns = new Map<string, Pattern>()
        const idMap = new Map<string, string>()

        for (const pattern of this.patterns.values()) {
            const newPattern = pattern.clone()
            idMap.set(pattern.id, newPattern.id)
            patterns.set(newPattern.id, pattern)
        }

        const timedPatterns = this.timedPatterns.map(tp => {
            const patternId = idMap.get(tp.pattern.id)!
            const pattern = patterns.get(patternId)!

            return new TimedPattern({
                time: tp.time,
                pattern,
                duration: tp.duration,
            })
        })

        return new NoteTrack(
            this.instrument,
            timedPatterns,
            this.markers.map(marker => ({ ...marker })),
            patterns
        )
    }

    get lastNote() {
        let last: { time: number, duration: number } | null = null

        for (const note of this.notes()) {
            if (!last || note.time + note.duration >= last.time + last.duration)
                last = note
        }

        return last
    }

    *notes() {
        for (const { time, pattern, offset, duration } of this.timedPatterns) {
            for (const note of pattern.notes) {
                if (note.time < offset || note.time >= offset + duration) {
                    continue
                }

                yield {
                    ...note,
                    time: note.time + time - offset,
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
            instrumentType: this.instrument.type,
            instrumentTuning: this.instrument.tuning,
            patterns: Array.from(this.patterns.values())
                .map(p => p.serialize()),
            markers: this.markers,
            timedPatterns: this.timedPatterns
                .sort((a, b) => a.time - b.time)
                .map(tp => tp.serialize())
        }
    }

    static deserialize(data: SerializedNoteTrack): NoteTrack {
        const patternsMap = new Map<string, Pattern>()
        const instrument = Instrument.deserialize(data.instrumentType, data.instrumentTuning)

        for (const patternData of data.patterns) {
            const pattern = Pattern.deserialize(patternData, instrument)
            patternsMap.set(pattern.id, pattern)
        }

        const timedPatterns = data.timedPatterns
            .map(tpData => TimedPattern.deserialize(tpData, patternsMap))

        return new NoteTrack(
            instrument,
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