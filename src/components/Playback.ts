import { Component } from "../engine/Component";
import type { Engine } from "../engine/Engine";
import { Bass } from "../sound/Bass";
import { Midi } from "../sound/Midi";
import type { MidiEvent } from "../sound/MidiEvent";
import { MusicSheet } from "../sound/MusicSheet";
import type { AudioBufferSoundNode } from "../sound/node/AudioElementSoundNode";

type InstrumentDescription = {
    type: MidiEvent.InstrumentType,
    stringsChannel: number[]
}

type PlaybackNote = {
    stringIndex: number,
    noteNumber: number,
    duration: number,
    fretNumber: number
}

export type PlaybackPlay = {
    time: number,
    notes: PlaybackNote[]
}

export class Playback extends Component {

    private _time: number = 0
    private _plays: PlaybackPlay[]

    private _soundNode: AudioBufferSoundNode
    private _tempo: Midi.Tempo
    private _timeDivision: Midi.TimeDivision
    private _ticksPerSecond: number

    private _playingSong = false

    private _eventIndex = 0

    constructor(
        engine: Engine,
        readonly sheet: MusicSheet,
        soundBuffer: AudioBuffer,
        private _songStart: number,
        readonly instrument: InstrumentDescription
    ) {
        super(engine)

        this._soundNode = this.engine.sound.createAudioBufferNode(soundBuffer)
        this._soundNode.connect(this.engine.sound.output)

        this._plays = sheet.events.slice(0, 20)
            .filter(event => event.type === MusicSheet.EventType.Note)
            .map(event => {

                return {
                    time: event.time,
                    notes: event.notes.map(note => {
                        const stringIndex = instrument.stringsChannel.indexOf(note.channel)
                        return {
                            duration: note.duration,
                            noteNumber: note.noteNumber,
                            stringIndex,
                            fretNumber: Bass.getFretNumber(note.noteNumber, stringIndex)
                        }
                    })
                }
            })

        this._tempo = sheet.tempo
        this._timeDivision = sheet.timeDivision
        this._ticksPerSecond = this._computeTicksPerSecond()

        console.log('Tempo', {
            bpm: Midi.Tempo.toBPM(this._tempo),
            tps: this._ticksPerSecond, 
            tempo: this._tempo
        })

        // Calculate sound timings
        for (const play of this._plays) {
            const time = play.time / this.ticksPerSecond
            console.log('Playing', play.notes.map(note => note.noteNumber).join(', '), 'at', time + 's, ticks:', play.time)
        }
    }

    get plays() {
        return this._plays
    }

    get ticksPerSecond() {
        return this._ticksPerSecond
    }

    update(deltaTime: number) {
        // TODO: shall treat events that lies between time and time + deltaTime
        this._time += deltaTime

        if (deltaTime === 0)
            return

        if (this._time >= this._songStart && !this._playingSong) {
            this._soundNode.play()
            this._playingSong = true
        }

        // Compute number of ticks to treat
        const maxTick = this._time * this._ticksPerSecond

        while (
            this._eventIndex < this.sheet.events.length &&
            this.sheet.events[this._eventIndex].time < maxTick
        ) {
            // const event = this.sheet.events[this._eventIndex]

            this._eventIndex += 1

            // Do something with events someday
        }
    }

    pause() {
        this._soundNode.pause()
        this._playingSong = false
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