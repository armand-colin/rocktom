import { Bass } from "../sound/instrument/Instrument";
import { Level } from "../sound/Level";
import { AudioTrack } from "../sound/song/AudioTrack";
import { FocusTrackBuilder } from "../sound/song/FocusTrack";
import { PatternBuilder } from "../sound/song/Pattern";
import { TempoTrack } from "../sound/song/TempoTrack";
import { TrackBuilder } from "../sound/song/Track";
import { Tempo } from "../sound/Tempo";

export function demo(): Level {

    const tempo = new Tempo(120)

    const white = tempo.ticksFromBeats(1)

    const focus = new FocusTrackBuilder()

    const pattern1 = new PatternBuilder("Sample")
        // Beat 1
        .noteRepeat(Bass.E, 0, white, 4)
        .build()

    const pattern2 = new PatternBuilder("Sample")
        // Beat 1
        .noteRepeat(Bass.E, 5, white, 4)
        .build()

    const pattern3 = new PatternBuilder("Sample")
        // Beat 1
        .noteRepeat(Bass.A, 6, white, 4)
        .build()

    const track = new TrackBuilder(new Bass())
        .pattern(pattern1)
        .addFocus([0, 4], focus, tempo.ticksFromSeconds(4))
        .pattern(pattern2)
        .addFocus([4, 8], focus, tempo.ticksFromSeconds(4))
        .pattern(pattern3)
        .addFocus([0, 9], focus, tempo.ticksFromSeconds(4))
        .pattern(pattern3)

    const level = new Level(
        "Demo",
        "Rocktom",
        {
            audio: new AudioTrack("JIniBJm2F7A", 2.3),
            bass: track.linearize(),
            tempo: new TempoTrack(tempo),
            focus: focus.build()
        }
    )

    return level

}