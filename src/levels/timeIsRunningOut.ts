import { Bass } from "../sound/instrument/Instrument";
import { Level } from "../sound/Level";
import { AudioTrack } from "../sound/song/AudioTrack";
import { FocusTrackBuilder } from "../sound/song/FocusTrack";
import { PatternBuilder } from "../sound/song/Pattern";
import { TempoTrack } from "../sound/song/TempoTrack";
import { TrackBuilder } from "../sound/song/Track";
import { Tempo } from "../sound/Tempo";

export function timeIsRunningOut(): Level {

    const tempo = new Tempo(118.2)

    const tempoTrack = TempoTrack.fromKeyframes([
        { seconds: 4.06, ticks: Tempo.bars(2) },
        { seconds: 12.21, ticks: Tempo.bars(6) },
        { seconds: 44.67, ticks: Tempo.bars(22) },
        { seconds: 89.31, ticks: Tempo.bars(44) },
        { seconds: 60 + 47.57, ticks: Tempo.bars(53) },
        { seconds: 120 + 13.98, ticks: Tempo.bars(66) },
        { seconds: 120 + 18.02, ticks: Tempo.bars(68) },
        { seconds: 120 + 38.14, ticks: Tempo.bars(78) },
        { seconds: 120 + 42.20, ticks: Tempo.bars(80) },
        { seconds: 180 + 2.52, ticks: Tempo.bars(90) },
    ])

    const long = Tempo.ticksFromQuarterNote(1)
    const short = Tempo.ticksFromQuarterNote(0.5)

    const focusTrack = new FocusTrackBuilder([1, 8])

    const baseRiff = new PatternBuilder("Main Riff")
        .fingerPosition(3)
        .note(Bass.E, 5, 0, undefined, long)
        .note(Bass.A, 3, 0, undefined, short)
        .note(Bass.E, 5, 0, undefined, long)
        .note(Bass.A, 3, 0, undefined, long)
        .note(Bass.E, 5, 0, undefined, short)
        .fingerPosition(5)
        .note(Bass.E, 7, 0, undefined, long)
        .note(Bass.E, 5, 0, undefined, short)
        .note(Bass.E, 7, 0, undefined, long)
        .note(Bass.A, 5, 0, undefined, long)
        .note(Bass.A, 6, 0, undefined, short)
        .note(Bass.E, 0, 0, undefined, long)
        .note(Bass.A, 7, 0, undefined, short)
        .note(Bass.E, 0, 0, undefined, long)
        .note(Bass.A, 7, 0, undefined, long)
        .fingerPosition(1)
        .note(Bass.E, 0, 0, undefined, short)
        .note(Bass.E, 1, 0, undefined, short)
        .note(Bass.E, 1, 0, undefined, short)
        .note(Bass.A, 3, 0, undefined, short)
        .note(Bass.E, 1, 0, undefined, short)
        .note(Bass.E, 3, 0, undefined, short)
        .note(Bass.A, 5, 0, undefined, long)
        .note(Bass.E, 3, 0, undefined, short)
        .build()

    const preChorus = new PatternBuilder("Pre-Chorus")
        .fingerPosition(3)
        .noteRepeat(Bass.D, 3, 0, 8, short)
        .noteRepeat(Bass.D, 5, 0, 8, short)
        .fingerPosition(5)
        .noteRepeat(Bass.D, 7, 0, 8, short)
        .fingerPosition(3)
        .noteRepeat(Bass.D, 5, 0, 8, short)
        .noteRepeat(Bass.D, 3, 0, 8, short)
        .noteRepeat(Bass.D, 5, 0, 8, short)
        .fingerPosition(5)
        .noteRepeat(Bass.D, 7, 0, 8, short)
        .fingerPosition(8)
        .noteRepeat(Bass.D, 10, 0, 6, short)
        .note(Bass.A, 10, long, { fret: 0, duration: long, connect: false })
        .build()

    const chorus = new PatternBuilder("Chorus")
        .noteRepeat(Bass.E, 1, 0, 8, short)
        .noteRepeat(Bass.E, 3, 0, 8, short)
        .noteRepeat(Bass.E, 5, 0, 8, short)
        .noteRepeat(Bass.A, 3, 0, 8, short)
        .noteRepeat(Bass.E, 1, 0, 8, short)
        .noteRepeat(Bass.E, 3, 0, 8, short)
        .noteRepeat(Bass.E, 5, 0, 8, short)
        .build()

    const chorusOut = new PatternBuilder("Chorus Out")
        .fingerPosition(1)
        .note(Bass.E, 1, 0, undefined, short)
        .note(Bass.E, 1, 0, undefined, short)
        .note(Bass.A, 3, 0, undefined, short)
        .note(Bass.E, 1, 0, undefined, short)
        .note(Bass.E, 3, 0, undefined, short)
        .note(Bass.E, 3, 0, undefined, short)
        .note(Bass.A, 5, 0, undefined, short)
        .note(Bass.E, 3, 0, undefined, short)
        .build()

    const chorusOutAlt = new PatternBuilder("Chorus Out Alt")
        .fingerPosition(3)
        .noteRepeat(Bass.A, 3, 0, 6, short)
        .note(Bass.E, 5, 0, undefined, short)
        .note(Bass.A, 3, 0, undefined, short)
        .build()

    const bridge = new PatternBuilder("Bridge")
        .fingerPosition(5)
        .note(Bass.A, 5, 0, undefined, short)
        .note(Bass.A, 5, 0, undefined, short)
        .note(Bass.A, 7, 0, undefined, short)
        .note(Bass.A, 7, 0, undefined, short)
        .note(Bass.A, 8, 0, undefined, short)
        .note(Bass.A, 8, 0, undefined, short)
        .note(Bass.D, 5, 0, undefined, short)
        .note(Bass.D, 6, 0, undefined, short)
        .note(Bass.D, 7, 0, undefined, short)
        .note(Bass.D, 7, 0, undefined, short)
        .note(Bass.A, 0, 0, undefined, short)
        .note(Bass.A, 0, 0, undefined, short)
        .note(Bass.A, 2, 0, undefined, short)
        .note(Bass.A, 2, 0, undefined, short)
        .note(Bass.A, 3, 0, undefined, short)
        .note(Bass.A, 3, 0, undefined, short)
        .build()

    const bridgeOut = new PatternBuilder("Bridge Out")
        .fingerPosition(3)
        .noteRepeat(Bass.E, 0, 0, 7, short) // 8
        .note(Bass.A, 7, 0, undefined, short) // 9
        .note(Bass.A, 5, 0, undefined, short / 2) // 9.5
        .note(Bass.A, 7, 0, undefined, short / 2) // 10
        .note(Bass.A, 5, 0, undefined, short / 2) // 10.5
        .note(Bass.A, 7, 0, undefined, short / 2) // 11
        .note(Bass.E, 7, 0, undefined, short / 2) // 11.5
        .silence(short / 2 * 3) // 13
        .note(Bass.A, 7, 0, undefined, short / 2) // 14.5
        .note(Bass.E, 7, 0, undefined, short / 2) // 15
        .note(Bass.A, 7, long, { fret: 5, duration: long, connect: false }) // 16
        .build()

    const bridgeOutAlt = new PatternBuilder("Bridge Out Alt")
        .fingerPosition(5)
        .noteRepeat(Bass.E, 0, 0, 8, short)
        .noteRepeat(Bass.E, 0, 0, 2, short)
        .note(Bass.E, 12, short, { fret: 7, duration: short, connect: false })
        .silence(short)
        .note(Bass.E, 0, 0, undefined, short)
        .note(Bass.E, 0, 0, undefined, short)
        .note(Bass.E, 12, short, { fret: 7, duration: short, connect: false })
        .silence(short)
        .build()

    const baseRiffAlt = new PatternBuilder("Main Riff Alt")
        .fingerPosition(3)
        .note(Bass.E, 5, 0, undefined, short)
        .note(Bass.E, 5, 0, undefined, short)
        .note(Bass.A, 3, 0, undefined, short)
        .note(Bass.E, 5, 0, undefined, short)
        .silence(short * 4)
        //
        .fingerPosition(5)
        .note(Bass.E, 7, 0, undefined, short)
        .note(Bass.E, 7, 0, undefined, short)
        .note(Bass.E, 5, 0, undefined, short)
        .note(Bass.E, 7, 0, undefined, short)
        .silence(short * 4)
        //
        .note(Bass.E, 0, 0, undefined, short)
        .note(Bass.E, 0, 0, undefined, short)
        .note(Bass.A, 7, 0, undefined, short)
        .note(Bass.E, 0, 0, undefined, short)
        .silence(short * 4)
        //
        .fingerPosition(1)
        .note(Bass.E, 1, 0, undefined, short)
        .note(Bass.E, 1, 0, undefined, short)
        .note(Bass.A, 3, 0, undefined, short)
        .note(Bass.E, 1, 0, undefined, short)
        .fingerPosition(3)
        .note(Bass.E, 3, 0, undefined, short)
        .note(Bass.E, 3, 0, undefined, short)
        .note(Bass.A, 5, 0, undefined, short)
        .note(Bass.E, 3, 0, undefined, short)
        .build()

    const outro = new PatternBuilder("Outro")
        .fingerPosition(3)
        .note(Bass.E, 5, 0, undefined, short)
        .note(Bass.E, 5, 0, undefined, short)
        .note(Bass.A, 3, 0, undefined, short)
        .note(Bass.E, 5, 0, undefined, short)
        .silence(short * 4)
        .note(Bass.E, 5, 0, undefined, short)
        .note(Bass.E, 5, 0, undefined, short)
        .note(Bass.A, 3, 0, undefined, short)
        .note(Bass.E, 5, 0, undefined, short)
        .silence(short * 4)
        .note(Bass.E, 5, 0, undefined, short)
        .note(Bass.E, 5, 0, undefined, short)
        .note(Bass.A, 3, 0, undefined, short)
        .note(Bass.E, 5, 0, undefined, short)
        .silence(short * 4)
        .note(Bass.E, 5, 0, undefined, short)
        .note(Bass.E, 5, 0, undefined, short)
        .note(Bass.A, 3, 0, undefined, short)
        .note(Bass.E, 5, 0, undefined, short)
        .silence(short * 4)
        .build()

    const track = new TrackBuilder(new Bass())
        .marker("Verse 1")
        .silence(Tempo.ticksFromQuarterNote(8))
        .pattern(baseRiff)
        .pattern(baseRiff)
        .pattern(baseRiff)
        .pattern(baseRiff)
        .pattern(baseRiff)
        .marker("Pre Chorus 1")
        .addFocus([1, 10], focusTrack, tempo.ticksFromSeconds(7), true)
        .pattern(preChorus)
        .addFocus([1, 8], focusTrack, tempo.ticksFromSeconds(4), true)
        .marker("Chorus 1")
        .pattern(chorus)
        .pattern(chorusOut)
        .marker("Verse 2")
        .pattern(baseRiffAlt)
        .pattern(baseRiffAlt)
        .pattern(baseRiffAlt)
        .pattern(baseRiff)
        .marker("Pre Chorus 2")
        .addFocus([1, 10], focusTrack, tempo.ticksFromSeconds(7), true)
        .pattern(preChorus)
        .addFocus([1, 8], focusTrack, tempo.ticksFromSeconds(4), true)
        .marker("Chorus 2")
        .pattern(chorus)
        .pattern(chorusOutAlt)
        .marker("Bridge")
        .pattern(bridge)
        .pattern(bridge)
        .pattern(bridge)
        .pattern(bridgeOut)
        .pattern(baseRiff)
        .pattern(baseRiff)
        .pattern(baseRiff)
        .marker("Pre Chorus 3")
        .addFocus([1, 10], focusTrack, tempo.ticksFromSeconds(7), true)
        .pattern(preChorus)
        .addFocus([1, 8], focusTrack, tempo.ticksFromSeconds(4), true)
        .marker("Chorus 3")
        .pattern(chorus)
        .pattern(chorusOutAlt)
        .marker("Outro")
        .pattern(bridge)
        .pattern(bridge)
        .addFocus([3, 12], focusTrack, tempo.ticksFromSeconds(7), true)
        .pattern(bridge)
        .pattern(bridgeOutAlt)
        .addFocus([3, 7], focusTrack, tempo.ticksFromSeconds(5), true)
        .pattern(outro)

    const level = new Level(
        "Time is Running Out",
        "Muse",
        {
            audio: new AudioTrack("O2IuJPh6h_A", 1.52),
            bass: track.build(),
            tempo: tempoTrack,
            focus: focusTrack.build()
        }
    )

    return level
}