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

    const long = tempo.ticksFromBeats(1)
    const short = tempo.ticksFromBeats(0.5)

    const focusTrack = new FocusTrackBuilder([0, 9])

    const baseRiffPattern = new PatternBuilder("Main Riff")
        .note(Bass.E, 5, long)
        .note(Bass.A, 3, short)
        .note(Bass.E, 5, long)
        .note(Bass.A, 3, long)
        .note(Bass.E, 5, short)
        .note(Bass.E, 7, long)
        .note(Bass.E, 5, short)
        .note(Bass.E, 7, long)
        .note(Bass.A, 5, long)
        .note(Bass.A, 6, short)
        .note(Bass.E, 0, long)
        .note(Bass.A, 7, short)
        .note(Bass.E, 0, long)
        .note(Bass.A, 7, long)
        .note(Bass.E, 0, short)
        .note(Bass.E, 1, short)
        .note(Bass.E, 1, short)
        .note(Bass.A, 3, short)
        .note(Bass.E, 1, short)
        .note(Bass.E, 3, short)
        .note(Bass.A, 5, long)
        .note(Bass.E, 3, short)
        .build()

    const preChorus = new PatternBuilder("Pre-Chorus")
        .noteRepeat(Bass.A, 8, short, 8)
        .noteRepeat(Bass.A, 10, short, 8)
        .noteRepeat(Bass.A, 12, short, 8)
        .noteRepeat(Bass.A, 10, short, 8)
        .noteRepeat(Bass.A, 8, short, 8)
        .noteRepeat(Bass.A, 10, short, 8)
        .noteRepeat(Bass.A, 12, short, 8)
        .noteRepeat(Bass.A, 15, short, 7)
        .note(Bass.E, 15, short)
        .build()

    const chorus = new PatternBuilder("Chorus")
        .noteRepeat(Bass.E, 1, short, 8)
        .noteRepeat(Bass.E, 3, short, 8)
        .noteRepeat(Bass.E, 5, short, 8)
        .noteRepeat(Bass.A, 3, short, 8)
        .noteRepeat(Bass.E, 1, short, 8)
        .noteRepeat(Bass.E, 3, short, 8)
        .noteRepeat(Bass.E, 5, short, 8)
        .note(Bass.E, 1, short)
        .note(Bass.E, 1, short)
        .note(Bass.A, 3, short)
        .note(Bass.E, 1, short)
        .note(Bass.E, 3, short)
        .note(Bass.E, 3, short)
        .note(Bass.A, 5, short)
        .note(Bass.E, 3, short)
        .build()

    const track = new TrackBuilder(new Bass())
        .silence(tempo.ticksFromBeats(8))
        .pattern(baseRiffPattern)
        .pattern(baseRiffPattern)
        .pattern(baseRiffPattern)
        .pattern(baseRiffPattern)
        .pattern(baseRiffPattern)
        .addFocus([8, 15], focusTrack, tempo.ticksFromSeconds(15))
        .pattern(preChorus)
        .addFocus([1, 6], focusTrack, tempo.ticksFromSeconds(7))
        .pattern(chorus)

    const level = new Level(
        "Time is Running Out",
        "Muse",
        {
            audio: new AudioTrack("O2IuJPh6h_A", 1.55),
            bass: track.linearize(),
            tempo: new TempoTrack(tempo),
            focus: focusTrack.build()
        }
    )

    return level
}