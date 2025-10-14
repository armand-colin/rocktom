interface Header {
    formatType: number,
    trackCount: number,
    timeDivision: TimeDivision
}

const HEADER_CHUNK_ID = 0x4D546864

type TimeDivision = {
    type: 0,
    tpqn: number
} | {
    type: 1,
    smtpe: number,
    tpf: number
}

export class MidiParser {

    private _i: number = 0

    private _header: Header

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
    }

    private _readInt2() {
        const value = (this.buffer[this._i] << 8) + this.buffer[this._i + 1]
        this._i += 2

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

    private _readTimeDivision(): TimeDivision {
        const bytes = this._readInt2()
        if (bytes & 0x8000) {
            const smtpe = bytes & 0x7f00
            const ticksPerFrame = bytes & 0x00ff
            return {
                type: 1,
                smtpe,
                tpf: ticksPerFrame
            }
        } else {
            const ticksPerQuarterNote = bytes
            return {
                type: 0,
                tpqn: ticksPerQuarterNote
            }
        }
    }

    private _readTrack() {
        const chunkId = this._readInt4()
        const chunkSize = this._readInt4()
        const startRead = this._i

        const track: MidiEvent[] = []

    }

}