import type { InstrumentTrackEditor } from "./InstrumentTrackEditor"
import type { String } from "../../sound/instrument/String"
import type { Note } from "../../sound/note/Note"

type ActiveVoice = {
    noteId: string
    note: Note
    string: String
}

export namespace PatternNotePlayer {

    export type State = {
        activeByTrack: Map<string, Map<number, ActiveVoice>>
    }

    export function createState(): State {
        return {
            activeByTrack: new Map(),
        }
    }

    export function update(
        state: State,
        ticks: number,
        trackEditors: readonly InstrumentTrackEditor[],
    ) {
        for (const trackEditor of trackEditors) {
            updateTrack(state, ticks, trackEditor)
        }

        for (const trackId of [...state.activeByTrack.keys()]) {
            if (!trackEditors.some(editor => editor.track.id === trackId)) {
                state.activeByTrack.delete(trackId)
            }
        }
    }

    export function stopAll(
        state: State,
        trackEditors: readonly InstrumentTrackEditor[],
    ) {
        for (const trackEditor of trackEditors)
            trackEditor.virtualInstrument.stopAll()
        state.activeByTrack.clear()
    }

    function updateTrack(
        state: State,
        ticks: number,
        trackEditor: InstrumentTrackEditor,
    ) {
        const instrument = trackEditor.virtualInstrument
        const trackId = trackEditor.track.id

        if (!trackEditor.open) {
            const previous = state.activeByTrack.get(trackId)
            if (previous && previous.size > 0)
                instrument.stopAll()
            state.activeByTrack.delete(trackId)
            return
        }

        const desired = collectActiveNotes(ticks, trackEditor)
        let active = state.activeByTrack.get(trackId)
        if (!active) {
            active = new Map()
            state.activeByTrack.set(trackId, active)
        }

        for (const [stringIndex, voice] of [...active.entries()]) {
            const next = desired.get(stringIndex)
            if (!next || next.noteId !== voice.noteId) {
                instrument.stopNote(voice.note, voice.string)
                active.delete(stringIndex)
            }
        }

        for (const [stringIndex, voice] of desired) {
            const current = active.get(stringIndex)
            if (current && current.noteId === voice.noteId)
                continue

            instrument.playNote(voice.note, voice.string)
            active.set(stringIndex, voice)
        }
    }

    function collectActiveNotes(
        ticks: number,
        trackEditor: InstrumentTrackEditor,
    ): Map<number, ActiveVoice> {
        const result = new Map<number, ActiveVoice>()

        for (const timedPattern of trackEditor.noteTrack.track.timedPatterns) {
            const windowStart = timedPattern.time
            const windowEnd = timedPattern.time + timedPattern.duration

            if (ticks < windowStart || ticks >= windowEnd)
                continue

            for (const note of timedPattern.pattern.notes) {
                if (note.time < timedPattern.offset || note.time >= timedPattern.offset + timedPattern.duration)
                    continue

                const absStart = timedPattern.time - timedPattern.offset + note.time
                const absEnd = Math.min(absStart + note.duration, windowEnd)

                if (ticks < absStart || ticks >= absEnd)
                    continue

                result.set(note.string.index, {
                    noteId: note.id,
                    note: note.string.fret(note.fret),
                    string: note.string,
                })
            }
        }

        return result
    }

}
