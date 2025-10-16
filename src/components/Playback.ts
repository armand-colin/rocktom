import { Component } from "../engine/Component";
import type { Engine } from "../engine/Engine";
import type { Midi } from "../sound/Midi";
import type { MidiEvent } from "../sound/MidiEvent";
import { MusicSheet } from "../sound/MusicSheet";

type InstrumentDescription = {
    type: MidiEvent.InstrumentType,
    stringsChannel: number[]
}

type PlaybackNote = {
    stringIndex: number,
    noteNumber: number,
    time: number,
    duration: number
}

export class Playback extends Component {

    private _time: number = 0
    private _notes: PlaybackNote[]

    private _tempo: Midi.Tempo
    private _timeDivision: Midi.TimeDivision
    private _ticksPerSecond: number

    constructor(
        engine: Engine,
        readonly sheet: MusicSheet,
        readonly instrument: InstrumentDescription
    ) {
        super(engine)
        this._notes = sheet.events
            .filter(event => event.type === MusicSheet.EventType.Note)
            .map(event => {
                const stringIndex = instrument.stringsChannel.indexOf(event.channel)

                if (stringIndex === -1)
                    console.warn("Got note that doesn't have matchin string index", event)

                return {
                    time: event.time,
                    duration: event.duration,
                    noteNumber: event.noteNumber,
                    stringIndex
                }
            })

        this._tempo = sheet.tempo
        this._timeDivision = sheet.timeDivision
        this._ticksPerSecond = this._computeTicksPerSecond()
        console.log(this._ticksPerSecond)
    }

    get notes() {
        return this._notes
    }

    get ticksPerSecond() {
        return this._ticksPerSecond
    }

    update(deltaTime: number) {
        // TODO: shall treat events that lies between time and time + deltaTime
        this._time += deltaTime
    }

    reset() {
        this._time = 0
    }
    
    private _computeTicksPerSecond(): number {
        console.log("Compute ticks per second", this._timeDivision, this._tempo)

        if (this._timeDivision.type === 1) {
            return this._timeDivision.ticksPerFrame * this._timeDivision.frameRate
        } else {
            return this._timeDivision.ticksPerBeat * 1_000_000 / this._tempo.microsecondsPerBeat
        }
    }

}