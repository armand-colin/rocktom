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
    const tempoTrack = new TempoTrack(tempo)

    const long = tempo.ticksFromQuarterNote(1)
    const short = tempo.ticksFromQuarterNote(0.5)

    tempoTrack.add(Tempo.bars(54), new Tempo(118.4))
    tempoTrack.add(Tempo.bars(70), new Tempo(119.2))
    tempoTrack.add(Tempo.bars(79), new Tempo(118.2))
    tempoTrack.add(Tempo.bars(107), new Tempo(119.5))

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

    console.log('Base Riff ticks:', baseRiff.duration)
    console.log('Four beats:', Tempo.bars(4))

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
        .noteRepeat(Bass.E, 0, 0, 8, short) // 8
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
        .noteRepeat(Bass.E, 0, 0, 10, short)
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
        .silence(tempo.ticksFromQuarterNote(8))
        .pattern(baseRiff)
        .pattern(baseRiff)
        .pattern(baseRiff)
        .pattern(baseRiff)
        .pattern(baseRiff)
        .addFocus([1, 10], focusTrack, tempo.ticksFromSeconds(7), true)
        .pattern(preChorus)
        .addFocus([1, 8], focusTrack, tempo.ticksFromSeconds(4), true)
        .pattern(chorus)
        .pattern(chorusOut)
        .pattern(baseRiffAlt)
        .pattern(baseRiffAlt)
        .pattern(baseRiffAlt)
        .pattern(baseRiff)
        .addFocus([1, 10], focusTrack, tempo.ticksFromSeconds(7), true)
        .pattern(preChorus)
        .addFocus([1, 8], focusTrack, tempo.ticksFromSeconds(4), true)
        .pattern(chorus)
        .pattern(chorusOutAlt)
        .pattern(bridge)
        .pattern(bridge)
        .pattern(bridge)
        .pattern(bridgeOut)
        .pattern(baseRiff)
        .pattern(baseRiff)
        .pattern(baseRiff)
        .addFocus([1, 10], focusTrack, tempo.ticksFromSeconds(7), true)
        .pattern(preChorus)
        .addFocus([1, 8], focusTrack, tempo.ticksFromSeconds(4), true)
        .pattern(chorus)
        .pattern(chorusOutAlt)
        .pattern(bridge)
        .pattern(bridge)
        .pattern(bridge)
        .pattern(bridgeOutAlt)
        .pattern(outro)

    const level = new Level(
        "Time is Running Out",
        "Muse",
        {
            audio: new AudioTrack("O2IuJPh6h_A", 1.52),
            bass: track.linearize(),
            tempo: new TempoTrack(tempo),
            focus: focusTrack.build()
        }
    )

    return level
}