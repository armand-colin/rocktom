import { Bass } from "../sound/instrument/Instrument";
import { Level } from "../sound/Level";
import { AudioTrack } from "../sound/song/AudioTrack";
import { FocusTrackBuilder } from "../sound/song/FocusTrack";
import { PatternBuilder } from "../sound/song/Pattern";
import { TempoTrack } from "../sound/song/TempoTrack";
import { TrackBuilder } from "../sound/song/Track";
import { Timing } from "../sound/timing/Timing";

export function liz(): Level {

    const timing = new Timing(80.6, 96)

    const q = timing.beatsToTicks(0.25)

    const intro = new PatternBuilder("Intro")
        // Beat 1
        .note(Bass.E, 6, q)
        .silence(q * 5)
        .note(Bass.E, 6, q)
        .silence(q)
        .note(Bass.D, 8, q)
        .note(Bass.D, 6, q)
        .silence(q * 2)
        .note(Bass.A, 8, q)
        .note(Bass.A, 6, q)
        .silence(q * 2)
        // Beat 2
        .note(Bass.A, 6, q * 4)
        .silence(q * 2)
        .note(Bass.A, 6, q * 6)
        .silence(q * 4)
        // Beat 3
        .note(Bass.E, 4, q * 4)
        .silence(q * 2)
        .note(Bass.D, 6, q)
        .silence(q)
        .note(Bass.E, 4, q * 4)
        .silence(q * 2)
        .note(Bass.E, 4, q)
        .silence(q)
        // Beat 4
        .note(Bass.E, 5, q * 8)
        .silence(q * 8)
        .build()

    const preChorus = new PatternBuilder("Pre-Chorus")
        // Beat 1
        .note(Bass.E, 6, q * 3)
        .silence(q * 3)
        .note(Bass.E, 6, q)
        .silence(q)
        .note(Bass.E, 6, q * 3)
        .silence(q * 5)
        // Beat 2
        .note(Bass.A, 6, q * 4)
        .silence(q * 2)
        .note(Bass.A, 6, q * 2)
        .silence(q * 2)
        .note(Bass.G, 8, q)
        .silence(q)
        .note(Bass.D, 8, q)
        .note(Bass.D, 6, q * 3)
        // Beat 3
        .note(Bass.E, 4, q * 3)
        .silence(q * 5)
        .note(Bass.E, 4, q * 3)
        .silence(q * 5)
        // Beat 4
        .note(Bass.E, 3, q * 3)
        .silence(q * 3)
        .note(Bass.D, 5, q * 3)
        .silence(q)
        .note(Bass.D, 3, q)
        .silence(q)
        .note(Bass.A, 6, q)
        .note(Bass.A, 3, q * 3)
        // Beat 5
        .build()

    const track = new TrackBuilder(new Bass())
        .silence(timing.beatsToTicks(4))
        .pattern(intro)
        .pattern(preChorus)

    const focusTrack = new FocusTrackBuilder([0, 9])
        .build()

    const level = new Level(
        "Liz",
        "Remi Wolf",
        timing,
        {
            audio: new AudioTrack("JIniBJm2F7A", 2.3),
            bass: track.linearize(),
            tempo: new TempoTrack(),
            focus: focusTrack
        }
    )

    return level
}