import { AudioTrack } from "../sound/AudioTrack";
import { Bass } from "../sound/instrument/Instrument";
import { Level } from "../sound/Level";
import { PatternBuilder } from "../sound/song/Pattern";
import { TrackBuilder } from "../sound/song/Track";
import { TempoTrack } from "../sound/TempoTrack";
import { Timing } from "../sound/timing/Timing";

export function timeIsRunningOut(): Level {

    const timing = new Timing(118.2, 96)

    const long = timing.beatsToTicks(1)
    const short = timing.beatsToTicks(0.5)

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
        .silence(timing.beatsToTicks(8))
        .pattern(baseRiffPattern)
        .pattern(baseRiffPattern)
        .pattern(baseRiffPattern)
        .pattern(baseRiffPattern)
        .pattern(baseRiffPattern)
        .pattern(preChorus)
        .pattern(chorus)


    const level = new Level(
        "Time is Running Out",
        "Muse",
        timing,
        {
            audio: new AudioTrack("O2IuJPh6h_A", 1.45),
            bass: track.linearize(),
            tempo: new TempoTrack()
        }
    )

    return level
}