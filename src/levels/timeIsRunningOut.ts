import timeIsRunningOutMp3 from "../assets/TimeIsRunningOut.mp3";
import { AudioBufferUtils } from "../sound/AudioBufferUtils";
import { Bass } from "../sound/Bass";
import { Level } from "../sound/Level";
import type { MidiNote } from "../sound/MidiNote";
import { Timing } from "../sound/timing/Timing";

export async function timeIsRunningOut(): Promise<Level> {

    const timing = new Timing(118.2, 96)
    const audioBuffer = await AudioBufferUtils.load(timeIsRunningOutMp3)

    const level = new Level(
        timing,
        audioBuffer,
        timing.seconds(1.51)
    )

    class Track {

        private _time: number = 0
        private _patterns: { time: number, pattern: Pattern }[] = []

        pattern(pattern: Pattern): this {
            this._patterns.push({
                time: this._time,
                pattern: pattern
            })
            this._time += pattern.duration
            return this
        }

        silence(time: number): this {
            this._time += time
            return this
        }

        pushToLevel() {
            for (const { time, pattern } of this._patterns) {
                for (const note of pattern.notes) {
                    level.addNote({
                        ...note,
                        time: time + note.time
                    })
                }
            }
        }

    }

    class Pattern {

        private _notes: MidiNote[] = []
        private _time: number = 0

        get duration() {
            return this._time
        }

        get notes() {
            return this._notes
        }

        silence(ticks: number): this {
            this._time += ticks
            return this
        }

        note(string: Bass.String, fret: number, duration: number): this {
            this._notes.push({
                time: this._time,
                duration: duration,
                fret: fret,
                string: string
            })

            this._time += duration
            return this
        }

        noteRepeat(string: Bass.String, fret: number, duration: number, times: number): this {
            for (let i = 0; i < times; i++) {
                this._notes.push({
                    time: this._time + i * duration,
                    duration: duration,
                    fret: fret,
                    string: string
                })
            }

            this._time += duration * times
            return this
        }

        pushToLevel(offset: number) {
            for (const note of this._notes) {
                level.addNote({
                    ...note,
                    time: note.time + offset
                })
            }
        }
    }

    const long = timing.beats(1)
    const short = timing.beats(0.5)

    const baseRiffPattern = new Pattern()
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

    const preChorus = new Pattern()
        .noteRepeat(Bass.A, 8, short, 8)
        .noteRepeat(Bass.A, 10, short, 8)
        .noteRepeat(Bass.A, 12, short, 8)
        .noteRepeat(Bass.A, 10, short, 8)
        .noteRepeat(Bass.A, 8, short, 8)
        .noteRepeat(Bass.A, 10, short, 8)
        .noteRepeat(Bass.A, 12, short, 8)
        .noteRepeat(Bass.A, 15, short, 7)
        .note(Bass.E, 15, short)

    const chorus = new Pattern()
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

    const track = new Track()
        .silence(timing.beats(8))
        .pattern(baseRiffPattern)
        .pattern(baseRiffPattern)
        .pattern(baseRiffPattern)
        .pattern(baseRiffPattern)
        .pattern(baseRiffPattern)
        .pattern(preChorus)
        .pattern(chorus)

    track.pushToLevel()

    return level
}