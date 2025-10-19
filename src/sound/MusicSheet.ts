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
            const pendingNotes: MusicSheet.PlayEvent[] = []

            const trackEvents: MusicSheet.Event[] = []
            // Find instrument type
            for (const midiEvent of track.events) {
                time += midiEvent.deltaTime

                if (midiEvent.type === MidiEvent.Type.ProgramChange)
                    currentInstrument = midiEvent.instrument

                if (midiEvent.type == MidiEvent.Type.NoteOn) {
                    // First, try to find note with same time
                    const sameNote = pendingNotes.find(note => note.time === time && note.instrument === currentInstrument)
                    if (sameNote) {
                        sameNote.notes.push({
                            channel: midiEvent.channel,
                            noteNumber: midiEvent.noteNumber,
                            duration: 0
                        })
                        continue
                    }

                    pendingNotes.push({
                        type: MusicSheet.EventType.Note,
                        time,
                        instrument: currentInstrument,
                        notes: [{
                            channel: midiEvent.channel,
                            noteNumber: midiEvent.noteNumber,
                            duration: 0
                        }]
                    })
                }

                if (midiEvent.type === MidiEvent.Type.NoteOff) {
                    
                    for (let i = 0; i < pendingNotes.length; i++) {
                        const event = pendingNotes[i]
                        
                        if (event.instrument !== currentInstrument)
                            continue
                        
                        let found = false
                        for (const note of event.notes) {
                            if (
                                note.channel === midiEvent.channel &&
                                note.noteNumber === midiEvent.noteNumber
                            ) {
                                note.duration = time - event.time
                                trackEvents.push(event)
                                pendingNotes.splice(i, 1)
                                found = true
                                break
                            }
                        }

                        if (found)
                            break
                    }

                    continue
                }

                if (
                    midiEvent.type === MidiEvent.Type.Meta &&
                    midiEvent.metaType === MidiEvent.MetaType.SetTempo &&
                    time === 0
                ) {
                    console.log('Midi message tempo', midiEvent.tempo)
                    tempo = midiEvent.tempo
                }

                if (
                    midiEvent.type === MidiEvent.Type.Meta &&
                    midiEvent.metaType === MidiEvent.MetaType.Marker
                ) {
                    if (midiEvent.name === "song_start") {
                        trackEvents.push({
                            type: MusicSheet.EventType.SongStart,
                            time
                        })
                    }
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
        SongStart = 1
    }

    export type Note = {
        noteNumber: number,
        channel: number,
        duration: number,
    }

    export type PlayEvent = {
        type: EventType.Note,
        time: number,
        instrument: MidiEvent.InstrumentType | null
        notes: Note[]
    }

    export type SongStartEvent = {
        type: EventType.SongStart,
        time: number
    }

    export type Event = PlayEvent | SongStartEvent
}