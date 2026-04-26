import type { Instrument } from "../sound/instrument/Instrument"
import type { String } from "../sound/instrument/String"

function getStringY(instrument: Instrument, string: String): number {
    const t = string.index / (instrument.strings.length - 1)
    return getY(t)
}

function getY(t: number) {
    return Rules.neckHeight * 0.5 - t * Rules.neckHeight
}

function getX(fret: number) {
    return (-(Rules.maxFret / 2) + fret) * Rules.fretWidth
}

export const Rules = {
    neckHeight: 1.6,
    fretWidth: 1,
    stringDistance: 0.6,
    maxFret: 15,
    timeRatio: 0.05,
    stringLength: 15 * 1, // maxFret * fretWidth
    getX,
    getY,
    getStringY,
}