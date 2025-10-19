import type { Bass } from "./Bass"

export interface MidiNote {

    time: number
    duration: number
    fret: number,
    string: Bass.String

}