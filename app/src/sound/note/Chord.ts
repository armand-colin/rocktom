import { Enum } from "../../utils/Enum"
import { Note } from "./Note"

const PitchClassValues = {
    C: "C",
    Cs: "C#",
    D: "D",
    Ds: "D#",
    E: "E",
    F: "F",
    Fs: "F#",
    G: "G",
    Gs: "G#",
    A: "A",
    As: "A#",
    B: "B",
} as const

export type PitchClass = typeof PitchClassValues[keyof typeof PitchClassValues]

export const PitchClass = Enum.create(PitchClassValues, {
    getLabel(pc: PitchClass) {
        return pc
    },
    fromIndex(index: number): PitchClass {
        return PitchClass.values[((index % 12) + 12) % 12]
    },
    toIndex(pc: PitchClass): number {
        return PitchClass.values.indexOf(pc)
    },
})

const ChordQualityValues = {
    Major: "major",
    Minor: "minor",
    Dominant7: "7",
    Minor7: "m7",
    Major7: "maj7",
    Sus2: "sus2",
    Sus4: "sus4",
} as const

export type ChordQuality = typeof ChordQualityValues[keyof typeof ChordQualityValues]

export const ChordQuality = Enum.create(ChordQualityValues, {
    getLabel(quality: ChordQuality) {
        switch (quality) {
            case ChordQuality.Major:
                return ""
            case ChordQuality.Minor:
                return "m"
            case ChordQuality.Dominant7:
                return "7"
            case ChordQuality.Minor7:
                return "m7"
            case ChordQuality.Major7:
                return "maj7"
            case ChordQuality.Sus2:
                return "sus2"
            case ChordQuality.Sus4:
                return "sus4"
            default:
                return "?"
        }
    },
    getName(quality: ChordQuality) {
        switch (quality) {
            case ChordQuality.Major:
                return "Major"
            case ChordQuality.Minor:
                return "Minor"
            case ChordQuality.Dominant7:
                return "Dominant 7"
            case ChordQuality.Minor7:
                return "Minor 7"
            case ChordQuality.Major7:
                return "Major 7"
            case ChordQuality.Sus2:
                return "Sus 2"
            case ChordQuality.Sus4:
                return "Sus 4"
            default:
                return "?"
        }
    },
    getIntervals(quality: ChordQuality): readonly number[] {
        switch (quality) {
            case ChordQuality.Major:
                return [0, 4, 7]
            case ChordQuality.Minor:
                return [0, 3, 7]
            case ChordQuality.Dominant7:
                return [0, 4, 7, 10]
            case ChordQuality.Minor7:
                return [0, 3, 7, 10]
            case ChordQuality.Major7:
                return [0, 4, 7, 11]
            case ChordQuality.Sus2:
                return [0, 2, 7]
            case ChordQuality.Sus4:
                return [0, 5, 7]
            default:
                return []
        }
    },
})

export type SerializedChord = {
    root: PitchClass
    quality: ChordQuality
    bass?: PitchClass
}

export class Chord {

    readonly root: PitchClass
    readonly quality: ChordQuality
    readonly bass: PitchClass | null

    constructor(root: PitchClass, quality: ChordQuality, bass?: PitchClass | null) {
        this.root = root
        this.quality = quality
        this.bass = bass && bass !== root ? bass : null
    }

    getLabel(): string {
        const label = PitchClass.getLabel(this.root) + ChordQuality.getLabel(this.quality)
        if (this.bass === null)
            return label

        return label + "/" + PitchClass.getLabel(this.bass)
    }

    getRootNote(octave: number): Note {
        return Note.fromName(this.root, octave)
    }

    getBassNote(octave: number): Note {
        return Note.fromName(this.bass ?? this.root, octave)
    }

    isSlash(): boolean {
        return this.bass !== null
    }

    getNotes(octave: number): Note[] {
        const root = this.getRootNote(octave)
        return this.getIntervals().map(interval => root.add(interval))
    }

    getIntervals(): readonly number[] {
        return ChordQuality.getIntervals(this.quality)
    }

    serialize(): SerializedChord {
        const data: SerializedChord = {
            root: this.root,
            quality: this.quality,
        }

        if (this.bass !== null)
            data.bass = this.bass

        return data
    }

    static deserialize(data: SerializedChord): Chord {
        const root = PitchClass.parse(data.root)
        const quality = ChordQuality.parse(data.quality)
        const bass = data.bass === undefined ? null : PitchClass.parse(data.bass)
        return new Chord(root, quality, bass)
    }

    static equals(a: Chord | null, b: Chord | null): boolean {
        if (a === b)
            return true
        if (a === null || b === null)
            return false

        return a.root === b.root && a.quality === b.quality && a.bass === b.bass
    }

}
