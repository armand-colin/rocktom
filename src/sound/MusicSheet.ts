import { Midi } from "./Midi";
import { MidiEvent } from "./MidiEvent";
import { MidiParser } from "./MidiParser";

function mergeEvents(a: MusicSheet.Event[], b: MusicSheet.Event[]): MusicSheet.Event[] {
    const merged: MusicSheet.Event[] = []

    let ai = 0
    let bi = 0

    while (ai < a.length || bi < b.length) {
        if (bi >= a.length) {
            merged.push(b[bi])
            bi++
            continue
        }

        if (ai >= b.length) {
            merged.push(a[ai])
            ai++
            continue
        }

        if (a[ai].time <= b[bi].time) {
            merged.push(a[ai])
            ai++
            continue
        }

        merged.push(b[bi])
        bi++
    }

    return merged
}

export class MusicSheet {

    static fromMidi(midi: MidiParser): MusicSheet {

        let events: MusicSheet.Event[] = []
        let tempo: Midi.Tempo = Midi.Tempo.bpm(120)

        for (const track of midi.tracks) {
            let currentInstrument: MidiEvent.InstrumentType | null = null
            let time = 0
            const pendingNotes: MusicSheet.NoteEvent[] = []

            const trackEvents: MusicSheet.Event[] = []
            // Find instrument type
            for (const midiEvent of track.events) {
                time += midiEvent.deltaTime

                if (midiEvent.type === MidiEvent.Type.ProgramChange)
                    currentInstrument = midiEvent.instrument

                if (midiEvent.type == MidiEvent.Type.NoteOn) {
                    pendingNotes.push({
                        type: MusicSheet.EventType.Note,
                        time,
                        duration: 0,
                        instrument: currentInstrument,
                        channel: midiEvent.channel,
                        noteNumber: midiEvent.noteNumber,
                    })
                }

                if (midiEvent.type === MidiEvent.Type.NoteOff) {
                    // Shall find note on
                    const index = pendingNotes.findIndex(note => note.channel === midiEvent.channel && note.noteNumber === midiEvent.noteNumber)

                    if (index > -1) {
                        const note = pendingNotes[index]
                        note.duration = time - note.time
                        trackEvents.push(note)
                        pendingNotes.splice(index, 1)
                    }
                }

                if (
                    midiEvent.type === MidiEvent.Type.Meta &&
                    midiEvent.metaType === MidiEvent.MetaType.SetTempo && 
                    time === 0
                ) {
                    tempo = midiEvent.tempo
                }
            }

            // Shall merge events
            events = mergeEvents(events, trackEvents)
        }

        return new MusicSheet(
            events, 
            midi.header.timeDivision,
            tempo
        )
    }

    readonly events: MusicSheet.Event[]
    readonly timeDivision: Midi.TimeDivision
    readonly tempo: Midi.Tempo

    constructor(
        events: MusicSheet.Event[], 
        timeDivision: Midi.TimeDivision,
        tempo: Midi.Tempo
    ) {
        this.events = events
        this.timeDivision = timeDivision
        this.tempo = tempo
    }

}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace MusicSheet {
    export enum EventType {
        Note = 0,
        Other = 1
    }

    export type NoteEvent = {
        type: EventType.Note,
        time: number,
        noteNumber: number,
        channel: number,
        duration: number,
        instrument: MidiEvent.InstrumentType | null
    }

    export type Event = NoteEvent
}