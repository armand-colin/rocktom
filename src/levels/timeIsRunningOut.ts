import audioUrl from "../assets/songs/TimeIsRunningOut.wav";
import { Bass } from "../sound/instrument/Instrument";
import { Level } from "../sound/Level";
import { AudioTrack, AudioType } from "../sound/song/AudioTrack";
import { FocusTrackBuilder } from "../sound/song/FocusTrack";
import { NoteTrackBuilder } from "../sound/song/NoteTrack";
import { PatternBuilder } from "../sound/song/Pattern";
import { TempoTrack } from "../sound/song/TempoTrack";
import { Tempo } from "../sound/Tempo";

export function timeIsRunningOut(): Level {

    const tempo = new Tempo(118.2)

    const tempoTrack = TempoTrack.fromKeyframes([
        { seconds: 4.07, ticks: Tempo.bars(2) },
        { seconds: 8.13, ticks: Tempo.bars(4) },
        { seconds: 12.22, ticks: Tempo.bars(6) },
        { seconds: 24.37, ticks: Tempo.bars(12) },
        { seconds: 36.54, ticks: Tempo.bars(18) },
        { seconds: 44.67, ticks: Tempo.bars(22) },
        { seconds: 52.78, ticks: Tempo.bars(26) },
        { seconds: 60 + 0.90, ticks: Tempo.bars(30) },
        { seconds: 60 + 9.01, ticks: Tempo.bars(34) },
        { seconds: 60 + 17.15, ticks: Tempo.bars(38) },
        { seconds: 60 + 23.23, ticks: Tempo.bars(41) },
        { seconds: 60 + 29.31, ticks: Tempo.bars(44) },
        { seconds: 60 + 47.57, ticks: Tempo.bars(53) },
        { seconds: 60 + 55.72, ticks: Tempo.bars(57) },
        { seconds: 120 + 1.80, ticks: Tempo.bars(60) },
        { seconds: 120 + 7.90, ticks: Tempo.bars(63) },
        { seconds: 120 + 13.98, ticks: Tempo.bars(66) },
        { seconds: 120 + 18.02, ticks: Tempo.bars(68) },
        { seconds: 120 + 26.10, ticks: Tempo.bars(72) },
        { seconds: 120 + 32.12, ticks: Tempo.bars(75) },
        { seconds: 120 + 38.14, ticks: Tempo.bars(78) },
        { seconds: 120 + 42.20, ticks: Tempo.bars(80) },
        { seconds: 120 + 50.32, ticks: Tempo.bars(84) },
        { seconds: 120 + 56.40, ticks: Tempo.bars(87) },
        { seconds: 180 + 2.52, ticks: Tempo.bars(90) },
        { seconds: 180 + 10.64, ticks: Tempo.bars(94) },
        { seconds: 180 + 16.72, ticks: Tempo.bars(97) },
        { seconds: 180 + 18.72, ticks: Tempo.bars(98) },
        { seconds: 180 + 26.87, ticks: Tempo.bars(102) },
        { seconds: 180 + 34.98, ticks: Tempo.bars(106) },
        { seconds: 180 + 51.02, ticks: Tempo.bars(114) },
        { seconds: 180 + 57.10, ticks: Tempo.bars(117) },
    ])

    const long = Tempo.ticksFromQuarterNote(1)
    const short = Tempo.ticksFromQuarterNote(0.5)

    const focusTrack = new FocusTrackBuilder([0, 8])

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
        .noteRepeat(Bass.E, 0, 0, 9, short)
        .note(Bass.A, 5, 0, undefined, short / 2)
        .note(Bass.E, 7, 0, undefined, short / 2)
        .silence(short / 2)
        .note(Bass.A, 5, 0, undefined, short / 2)
        .note(Bass.A, 7, 0, undefined, short / 2)
        .note(Bass.E, 0, 0, undefined, short / 2)
        .note(Bass.E, 0, 0, undefined, short / 2)
        .silence(short / 2)
        .note(Bass.A, 7, 0, undefined, short / 2)
        .note(Bass.E, 0, 0, undefined, short / 2)
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

    const track = new NoteTrackBuilder(new Bass())
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
        .addFocus([0, 8], focusTrack, tempo.ticksFromSeconds(4), true)
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
        .addFocus([0, 8], focusTrack, tempo.ticksFromSeconds(4), true)
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
        .addFocus([0, 8], focusTrack, tempo.ticksFromSeconds(4), true)
        .marker("Chorus 3")
        .pattern(chorus)
        .pattern(chorusOutAlt)
        .marker("Outro")
        .pattern(bridge)
        .pattern(bridge)
        .addFocus([0, 12], focusTrack, tempo.ticksFromSeconds(7), true)
        .pattern(bridge)
        .pattern(bridgeOutAlt)
        .addFocus([3, 7], focusTrack, tempo.ticksFromSeconds(5), true)
        .pattern(outro)

    const level = new Level({
        id: "muse-time-is-running-out",
        name: "Time is Running Out",
        author: "Muse",
        instrument: new Bass(),
        tracks: {
            audio: new AudioTrack({
                type: AudioType.Url,
                url: audioUrl
            }, 1.52, 180),
            note: track.build(),
            tempo: tempoTrack,
            focus: focusTrack.build()
        }
    })

    return level
}