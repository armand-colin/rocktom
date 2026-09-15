import { useState } from "react"
import type { LevelEditor } from "../../components/editor/LevelEditor"
import type { Instrument } from "../../sound/instrument/Instrument"
import { InstrumentDropdown } from "../instrumentDropdown/InstrumentDropdown"
import { Popup } from "../popup/Popup"
import { FormButtons } from "../formButtons/FormButtons"
import { Button } from "../button/Button"
import { Form } from "../form/Form"
import { FormSchema } from "../../form/FormSchema"
import { useForm } from "../../hooks/useForm"
import { FormInputField } from "../form/FormInputField"
import type { InstrumentTrack } from "../../sound/song/InstrumentTrack"

const schema = FormSchema.default()

export function AddInstrumentTrackPopup(props: {
    close: () => void,
    placeAfter?: InstrumentTrack,
    editor: LevelEditor,
}) {
    const [instrument, setInstrument] = useState<Instrument | null>(null)
    const handler = useForm(schema)

    function onSubmit() {
        if (!instrument)
            return

        props.editor.addInstrumentTrack(instrument)
        props.close()
    }

    return <Popup.BaseContainer className="w-svw max-w-80">
        <Popup.BaseTitle title="Add note track" close={props.close} />
        <Form handler={handler} onSubmit={onSubmit} className="grid gap-7">
            <FormInputField label="Instrument">
                <InstrumentDropdown
                    value={instrument}
                    onChange={setInstrument}
                />
            </FormInputField>
            <FormButtons>
                <Button type="button" onClick={props.close}>
                    Cancel
                </Button>
                <Button theme="primary" type="submit">
                    Add track
                </Button>
            </FormButtons>
        </Form>
    </Popup.BaseContainer>
}