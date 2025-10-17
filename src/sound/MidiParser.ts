import type { Midi } from "./Midi"
import { MidiEvent } from "./MidiEvent"

interface Header {
    formatType: number,
    trackCount: number,
    timeDivision: Midi.TimeDivision
}

const HEADER_CHUNK_ID = 0x4D546864
const TRACK_CHUNK_ID = 0x4D54726B

type Track = {
    events: MidiEvent[]
}

function readVariableInt(buffer: Uint8Array, cursor: number): { length: number, value: number } {
    let sum = 0
    let i = 0;

    for (; i < 4; i++) {
        const byte = buffer[cursor + i]

        if ((byte & 0b10000000) === 0) {
            sum = sum + byte
            break
        }

        sum = (sum + (byte & 0b0111_1111)) << 7
    }

    return {
        length: i + 1,
        value: sum
    }
}

export class MidiParser {

    private _i: number = 0

    private _header: Header
    private _tracks: Track[] = []

    constructor(readonly buffer: Uint8Array) {
        const chunkId = this._readInt4()
        const chunkSize = this._readInt4()

        if (chunkId !== HEADER_CHUNK_ID || chunkSize !== 6)
            throw new Error("Header is malformed")

        this._header = {
            formatType: this._readInt2(),
            trackCount: this._readInt2(),
            timeDivision: this._readTimeDivision()
        }

        while (this._i < this.buffer.length - 1) {
            const chunkId = this._readInt4()

            if (chunkId === TRACK_CHUNK_ID) {
                const track = this._readTrack()
                this._tracks.push(track)
                continue
            }

            console.log("Unknown chunkId", chunkId.toString(16))
        }
    }

    get tracks() {
        return this._tracks
    }

    get header() {
        return this._header
    }

    private _skip(bytes: number) {
        this._i += bytes
    }

    private _readInt1() {
        const value = this.buffer[this._i]
        this._i += 1

        return value
    }

    private _readInt2() {
        const value = (this.buffer[this._i] << 8) + this.buffer[this._i + 1]
        this._i += 2

        return value
    }

    private _readInt3() {
        const value = (this.buffer[this._i] << 16) + (this.buffer[this._i] << 8) + this.buffer[this._i + 1]
        this._i += 3

        return value
    }

    private _readInt4() {
        const value = (this.buffer[this._i] << 24) +
            (this.buffer[this._i + 1] << 16) +
            (this.buffer[this._i + 2] << 8) +
            this.buffer[this._i + 3]

        this._i += 4

        return value
    }

    private _readTimeDivision(): Midi.TimeDivision {
        const bytes = this._readInt2()

        if (bytes & 0x8000) {
            // F / S
            const frameRate = bytes & 0x7f00
            // T / S
            const ticksPerFrame = bytes & 0x00ff
            // Compute ticks per second
            return {
                type: 1,
                frameRate: frameRate,
                ticksPerFrame: ticksPerFrame
            }
        } else {
            const ticksPerQuarterNote = bytes
            return {
                type: 0,
                ticksPerBeat: ticksPerQuarterNote
            }
        }
    }

    private _readVariableInt() {
        const {
            length,
            value
        } = readVariableInt(this.buffer, this._i)

        this._i += length
        return value
    }

    private _readASCII(length: number): string {
        const decoder = new TextDecoder()
        const text = decoder.decode(this.buffer.slice(this._i, this._i + length))

        this._i += length
        return text
    }

    private _readTrack(): Track {
        const chunkSize = this._readInt4()
        const startRead = this._i

        const events: MidiEvent[] = []

        while (this._i < startRead + chunkSize) {
            const deltaTime = this._readVariableInt()
            const type = this._readInt1()

            if (type === MidiEvent.Type.Meta) {
                const event = this._readMetaEvent(deltaTime)
                events.push(event)
                continue
            }

            if (type === MidiEvent.Type.System) {
                const event = this._readSystemEvent(deltaTime)
                events.push(event)
                continue
            }

            // Split into channel / type
            const channel = type & 0b0000_1111
            const channelType = type >> 4

            if (MidiEvent.ChannelTypes.includes(channelType)) {
                const event = this._readChannelEvent(deltaTime, channelType, channel)
                events.push(event)
                continue
            }

            throw new Error("Unknown event type " + type)
        }

        return {
            events
        }
    }

    private _readChannelEvent(deltaTime: number, type: MidiEvent.ChannelType, channel: number): MidiEvent.Channel {
        switch (type) {
            case MidiEvent.Type.NoteOn: {
                const noteNumber = this._readInt1()
                const velocity = this._readInt1()

                return {
                    type: velocity === 0 ? MidiEvent.Type.NoteOff : MidiEvent.Type.NoteOn,
                    deltaTime,
                    channel,
                    noteNumber,
                    velocity
                }
            }

            case MidiEvent.Type.NoteOff: {
                return {
                    type,
                    deltaTime,
                    channel,
                    noteNumber: this._readInt1(),
                    velocity: this._readInt1()
                }
            }

            case MidiEvent.Type.ChannelAftertouch: {
                return {
                    type,
                    deltaTime,
                    channel,
                    parameter1: this._readInt1()
                }
            }

            case MidiEvent.Type.ProgramChange: {
                return {
                    type,
                    deltaTime,
                    channel,
                    instrument: this._readInt1()
                }
            }
        }

        return {
            type,
            deltaTime,
            channel,
            parameter1: this._readInt1(),
            parameter2: this._readInt1()
        }
    }

    private _readMetaEvent(deltaTime: number): MidiEvent.Meta {
        const metaType = this._readInt1()
        const length = this._readVariableInt()

        console.log("meta event", metaType, MidiEvent.MetaType[metaType])

        if (metaType === MidiEvent.MetaType.SetTempo) {
            return {
                deltaTime,
                type: MidiEvent.Type.Meta,
                metaType: MidiEvent.MetaType.SetTempo,
                tempo: {
                    microsecondsPerBeat: this._readInt3()
                }
            }
        }

        if (metaType === MidiEvent.MetaType.Marker) {
            return {
                deltaTime,
                type: MidiEvent.Type.Meta,
                metaType,
                name: this._readASCII(length)
            }
        }

        if (metaType === MidiEvent.MetaType.SequenceName) {
            const name = this._readASCII(length)
            console.log("Found sequence", name)

            return {
                deltaTime,
                type: MidiEvent.Type.Meta,
                metaType,
                name
            }
        }

        // Skipping
        this._skip(length)

        return {
            deltaTime,
            type: MidiEvent.Type.Meta,
            metaType: MidiEvent.MetaType.Unknown,
        }
    }

    private _readSystemEvent(deltaTime: number): MidiEvent.System {
        const length = this._readVariableInt()

        // Skipping, must be trailing 0xF7 at the end
        this._skip(length)

        if (this._readInt1() !== 0xF0)
            throw new Error("System event not finishing with correct byte")

        return {
            deltaTime,
            type: MidiEvent.Type.System,
        }
    }

}