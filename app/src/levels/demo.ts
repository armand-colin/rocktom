import { Bass } from "../sound/instrument/Instrument";
import { Level } from "../sound/Level";
import { AudioTrack } from "../sound/song/AudioTrack";
import { FocusTrackBuilder } from "../sound/song/FocusTrack";
import { NoteTrackBuilder } from "../sound/song/NoteTrack";
import { PatternBuilder } from "../sound/song/Pattern";
import { TempoTrack } from "../sound/song/TempoTrack";
import { Tempo } from "../sound/Tempo";

export function demo(): Level {
    const tempoTrack = TempoTrack.fromKeyframes([
        { seconds: 4, ticks: Tempo.bars(1) },
        { seconds: 8, ticks: Tempo.bars(1 + 2) },
        { seconds: 12, ticks: Tempo.bars(1 + 2 + 4) },
    ])

    const instrument = new Bass()
    const white = Tempo.ticksFromQuarterNote(1)

    const focus = new FocusTrackBuilder()

    const pattern1 = new PatternBuilder("Sample", instrument)
        // Beat 1
        .fingerPosition(2)
        .noteRepeat(Bass.E, 0, white, 1)
        .note(Bass.E, 4, white, { fret: 2, duration: white / 2, connect: false })
        .note(Bass.E, 4, white, { fret: 2, duration: white / 2, connect: true })
        .note(Bass.E, 2, white)
        .build()

    const pattern2 = new PatternBuilder("Sample", instrument)
        // Beat 1
        .noteRepeat(Bass.E, 5, white, 4)
        .build()

    const pattern3 = new PatternBuilder("Sample", instrument)
        // Beat 1
        .noteRepeat(Bass.A, 6, white, 4)
        .build()

    const track = new NoteTrackBuilder(instrument)
        .pattern(pattern1)
        .addFocus([0, 4], focus, tempoTrack.ticksFromSeconds(4))
        .pattern(pattern2)
        .addFocus([4, 8], focus, tempoTrack.ticksFromSeconds(4))
        .pattern(pattern3)
        .pattern(pattern3)

    const level = new Level({
        id: "demo",
        name: "Demo",
        tracks: {
            audio: new AudioTrack({
                playbackId: null,
                time: 2.3
            }),
            note: track.build(),
            tempo: tempoTrack,
            focus: focus.build()
        }
    })

    return level

}