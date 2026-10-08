import { useState } from "react"
import type { NoteEvent } from "../../../sound/song/NoteEvent"
import { NumberInput } from "../../input/NumberInput"
import { Popup } from "../../popup/Popup"
import { FormInputField } from "../../form/FormInputField"
import { Button, ButtonTheme } from "../../button/Button"
import { Rules } from "../../../3d/Rules"
import { Toggle } from "../../toggle/Toggle"
import { Chord, ChordQuality, PitchClass } from "../../../sound/note/Chord"
import { Dropdown } from "../../dropdown/Dropdown"
import { UiSize } from "../../UiSize"
import "./NoteEventPopup.scss"

type Editable<T> = {
    value: T | null
    dirty: boolean
}

function initEditable<T>(values: T[]): Editable<T> {
    const first = values[0]
    const allEqual = values.every(value => value === first)
    return { value: allEqual ? first : null, dirty: false }
}

function initEditableChord(chords: (Chord | null)[]): Editable<Chord | null> {
    const first = chords[0]
    const allEqual = chords.every(chord => Chord.equals(chord, first))
    return { value: allEqual ? first : null, dirty: false }
}

function defaultChordFromNotes(notes: NoteEvent[]): Chord {
    const note = notes[0]
    const pitchIndex = note.string.fret(note.fret).index
    return new Chord(PitchClass.fromIndex(pitchIndex), ChordQuality.Major)
}

const qualityOptions = ChordQuality.values.map(quality => ({
    value: quality,
    label: ChordQuality.getName(quality),
}))

type PitchClassPickerProps = {
    value: PitchClass | null
    onChange: (value: PitchClass) => void
    allowNone?: boolean
    noneSelected?: boolean
    onNone?: () => void
}

function PitchClassPicker(props: PitchClassPickerProps) {
    return <div className="PitchClassPicker">
        {
            props.allowNone && <Button
                size={UiSize.XS}
                theme={props.noneSelected ? ButtonTheme.Primary : ButtonTheme.Default}
                onClick={() => props.onNone?.()}
            >
                —
            </Button>
        }
        {
            PitchClass.values.map(pc => (
                <Button
                    key={pc}
                    size={UiSize.XS}
                    theme={props.value === pc && !props.noneSelected ? ButtonTheme.Primary : ButtonTheme.Default}
                    onClick={() => props.onChange(pc)}
                >
                    {PitchClass.getLabel(pc)}
                </Button>
            ))
        }
    </div>
}

export function NoteEventPopup(props: {
    notes: NoteEvent[],
    onUpdate: () => void,
    close: () => void
}) {
    const notes = props.notes
    const allHaveSlide = notes.length > 0 && notes.every(note => note.slide !== null)

    const [fingerPosition, setFingerPosition] = useState<Editable<number>>(() =>
        initEditable(notes.map(note => note.fingerPosition))
    )
    const [slideConnects, setSlideConnects] = useState<Editable<boolean>>(() =>
        allHaveSlide
            ? initEditable(notes.map(note => note.slide!.connect))
            : { value: false, dirty: false }
    )
    const [chord, setChord] = useState<Editable<Chord | null>>(() =>
        initEditableChord(notes.map(note => note.chord))
    )

    const chordsEqual = notes.every(note => Chord.equals(note.chord, notes[0].chord))
    const chordEnabled: boolean | null = chord.dirty
        ? chord.value !== null
        : chordsEqual
            ? notes[0].chord !== null
            : null

    function setChordEnabled(enabled: boolean) {
        if (enabled) {
            setChord({
                value: chord.value ?? defaultChordFromNotes(notes),
                dirty: true,
            })
            return
        }

        setChord({ value: null, dirty: true })
    }

    function updateChord(next: Chord) {
        setChord({ value: next, dirty: true })
    }

    function onSave() {
        for (const note of notes) {
            if (fingerPosition.dirty && fingerPosition.value !== null)
                note.fingerPosition = fingerPosition.value

            if (slideConnects.dirty && note.slide)
                note.slide.connect = slideConnects.value === true

            if (chord.dirty)
                note.chord = chord.value
        }

        props.onUpdate()
        props.close()
    }

    const title = notes.length === 1
        ? "Note Event"
        : `Note Events (${notes.length})`

    const activeChord = chord.value

    return <Popup.BaseContainer className="NoteEventPopup" size="sm">
        <Popup.BaseTitle title={title} />
        <Popup.BaseContent>
            <FormInputField label="Finger position">
                <NumberInput
                    name="fingerPosition"
                    onChange={value => setFingerPosition({ value, dirty: true })}
                    value={fingerPosition.value}
                    min={0}
                    max={Rules.maxFret}
                    step={1}
                />
            </FormInputField>
            {
                allHaveSlide && <FormInputField label="Slide connects">
                    <Toggle
                        value={slideConnects.value}
                        onChange={value => setSlideConnects({ value, dirty: true })}
                    />
                </FormInputField>
            }

            <FormInputField label="Chord">
                <Toggle
                    value={chordEnabled}
                    onChange={setChordEnabled}
                />
            </FormInputField>

            {
                activeChord !== null && <>
                    <FormInputField label="Root">
                        <PitchClassPicker
                            value={activeChord.root}
                            onChange={root => updateChord(new Chord(root, activeChord.quality, activeChord.bass))}
                        />
                    </FormInputField>

                    <FormInputField label="Quality">
                        <Dropdown
                            options={qualityOptions}
                            value={activeChord.quality}
                            onChange={option => {
                                if (option === null)
                                    return
                                updateChord(new Chord(activeChord.root, ChordQuality.parse(option.value), activeChord.bass))
                            }}
                            size={UiSize.S}
                        />
                    </FormInputField>

                    <FormInputField label="Bass">
                        <PitchClassPicker
                            value={activeChord.bass}
                            allowNone
                            noneSelected={activeChord.bass === null}
                            onNone={() => updateChord(new Chord(activeChord.root, activeChord.quality, null))}
                            onChange={bass => updateChord(new Chord(activeChord.root, activeChord.quality, bass))}
                        />
                    </FormInputField>

                    <p className="chord-preview">{activeChord.getLabel()}</p>
                </>
            }

            <Button type="submit" onClick={onSave}>Save</Button>
        </Popup.BaseContent>
    </Popup.BaseContainer>
}
