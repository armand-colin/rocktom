import { Component } from "../engine/Component";
import type { Engine } from "../engine/Engine";
import type { Midi } from "../sound/Midi";
import type { MidiEvent } from "../sound/MidiEvent";
import { MusicSheet } from "../sound/MusicSheet";
import type { AudioElementSoundNode } from "../sound/node/AudioElementSoundNode";

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

    private _audio: HTMLAudioElement
    private _soundNode: AudioElementSoundNode
    private _tempo: Midi.Tempo
    private _timeDivision: Midi.TimeDivision
    private _ticksPerSecond: number

    private _eventIndex = 0

    constructor(
        engine: Engine,
        readonly sheet: MusicSheet,
        soundUrl: string,
        readonly instrument: InstrumentDescription
    ) {
        super(engine)

        this._audio = new Audio(soundUrl)
        this._soundNode = this.engine.sound.createAudioElementNode(this._audio)
        
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
        if (deltaTime === 0)
            return

        // Compute number of ticks to treat
        const maxTick = this._time * this._ticksPerSecond

        while (
            this._eventIndex < this.sheet.events.length && 
            this.sheet.events[this._eventIndex].time < maxTick
        ) {
            const event = this.sheet.events[this._eventIndex]
            this._eventIndex += 1

            // Do something with events
                        
        }
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