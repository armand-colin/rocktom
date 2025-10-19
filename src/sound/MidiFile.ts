import type { Midi } from "./Midi";
import type { MidiTrack } from "./MidiTrack";

export class MidiFile {

    private _tempo: Midi.Tempo
    private _timeDivision: Midi.TimeDivision

    private _tracks: MidiTrack[] = []

    constructor(opts: { tempo: Midi.Tempo, timeDivision: Midi.TimeDivision }) {
        this._tempo = opts.tempo
        this._timeDivision = opts.timeDivision
    }

    addTrack(track: MidiTrack) {
        this._tracks.push(track)
    }

}