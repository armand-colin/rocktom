
export type MidiEvent = (
    MidiEvent.Channel |
    MidiEvent.Meta |
    MidiEvent.System
)

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace MidiEvent {

    export enum InstrumentType {
        SynthBass = 38
    }

    export enum Type {
        // Channel
        NoteOff = 0x8,
        NoteOn = 0x9,
        NoteAfterTouch = 0xA,
        Controller = 0xB,
        ProgramChange = 0xC,
        ChannelAftertouch = 0xD,
        PitchBend = 0xE,
        // Meta
        Meta = 0xFF,
        // System
        System = 0xF0
    }


    export type Channel = {
        deltaTime: number,
        channel: number
    } & (
            {
                type: MidiEvent.Type.NoteOn | MidiEvent.Type.NoteOff,
                noteNumber: number,
                velocity: number
            } | {
                type: MidiEvent.Type.NoteAfterTouch |
                MidiEvent.Type.Controller |
                MidiEvent.Type.PitchBend,
                parameter1: number,
                parameter2: number
            } | {
                type: MidiEvent.Type.ProgramChange,
                instrument: InstrumentType,
            } | {
                type: MidiEvent.Type.ChannelAftertouch,
                parameter1: number,
            }
        )

    export type ChannelType = Channel["type"]

    export const ChannelTypes = [
        MidiEvent.Type.NoteAfterTouch,
        MidiEvent.Type.Controller,
        MidiEvent.Type.ProgramChange,
        MidiEvent.Type.ChannelAftertouch,
        MidiEvent.Type.PitchBend,
        MidiEvent.Type.NoteOn,
        MidiEvent.Type.NoteOff
    ]

    export enum MetaType {
        SequenceNumber = 0x00,
        TextEvent = 0x01,
        CopyrightNotice = 0x02,
        SequenceName = 0x03,
        InstrumentName = 0x04,
        Lyrics = 0x05,
        Marker = 0x06,
        CuePoint = 0x07,
        ChannelPrefix = 0x20,
        EndOfTrack = 0x2F,
        SetTempo = 0x51,
        SmpteOffset = 0x54,
        TimeSignature = 0x58,
        KeySignature = 0x59,
        SequencerSpecific = 0x7F,
    }

    export type Meta = {
        type: MidiEvent.Type.Meta
        deltaTime: number,
        metaType: MetaType
    }

    export type System = {
        deltaTime: number,
        type: MidiEvent.Type.System
    }
}