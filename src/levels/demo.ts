import { Bass } from "../sound/instrument/Instrument";
import { Level } from "../sound/Level";
import { AudioTrack, AudioType } from "../sound/song/AudioTrack";
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

    const white = Tempo.ticksFromQuarterNote(1)

    const focus = new FocusTrackBuilder()

    const pattern1 = new PatternBuilder("Sample")
        // Beat 1
        .fingerPosition(2)
        .noteRepeat(Bass.E, 0, white, 1)
        .note(Bass.E, 4, white, { fret: 2, duration: white / 2, connect: false })
        .note(Bass.E, 4, white, { fret: 2, duration: white / 2, connect: true })
        .note(Bass.E, 2, white)
        .build()

    const pattern2 = new PatternBuilder("Sample")
        // Beat 1
        .noteRepeat(Bass.E, 5, white, 4)
        .build()

    const pattern3 = new PatternBuilder("Sample")
        // Beat 1
        .noteRepeat(Bass.A, 6, white, 4)
        .build()

    const track = new NoteTrackBuilder(new Bass())
        .pattern(pattern1)
        .addFocus([0, 4], focus, tempoTrack.ticksFromSeconds(4))
        .pattern(pattern2)
        .addFocus([4, 8], focus, tempoTrack.ticksFromSeconds(4))
        .pattern(pattern3)
        .pattern(pattern3)

    const level = new Level({
        id: "demo",
        name: "Demo",
        author: "Rocktom",
        instrument: new Bass(),
        tracks: {
            audio: new AudioTrack({
                type: AudioType.YouTube,
                youtubeVideoId: "JIniBJm2F7A"
            }, 2.3, 125),
            note: track.build(),
            tempo: tempoTrack,
            focus: focus.build()
        }
    })

    return level

}