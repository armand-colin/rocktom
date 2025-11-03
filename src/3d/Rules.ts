import type { Instrument } from "../sound/instrument/Instrument";
import type { String } from "../sound/instrument/String";

function getY(instrument: Instrument, string: String) {
    const height = (instrument.strings.length - 1) * Rules.stringDistance
    // String 0 should be on top
    return height / 2 - string.index * Rules.stringDistance
}

function getX(fret: number) {
    return (-(Rules.maxFret / 2) + fret) * Rules.fretWidth
}

export const Rules = {
    fretWidth: 1,
    stringDistance: 0.6,
    maxFret: 15,
    stringLength: 15 * 1, // maxFret * fretWidth
    getX,
    getY,
}