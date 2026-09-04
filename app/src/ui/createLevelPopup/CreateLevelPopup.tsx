import { FormField } from "../../form/FormField";
import type { FormHandler } from "../../form/FormHandler";
import { FormSchema } from "../../form/FormSchema";
import { useForm } from "../../hooks/useForm";
import type { LevelEntity } from "../../queries/level/LevelEntity";
import { LevelQueries } from "../../queries/level/LevelQueries";
import { InstrumentType } from "../../sound/instrument/Instrument";
import { Button, ButtonTheme } from "../button/Button";
import { Form } from "../form/Form";
import { FormInputField } from "../form/FormInputField";
import { FormButtons } from "../formButtons/FormButtons";
import { StringInput } from "../input/StringInput";
import { Popup } from "../popup/Popup";
import { Spinner } from "../spinner/Spinner";

type Props = {
    onSuccess: (level: LevelEntity) => void,
    close: () => void,
}

const schema = new FormSchema({
    name: FormField.string().min(1).max(100),
})

export function CreateLevelPopup(props: Props) {
    const handler = useForm(schema)

    async function onSubmit(e: FormHandler.Result<typeof schema>) {
        const result = await LevelQueries.create({
            name: e.json.name,
            instrumentTypes: [InstrumentType.Bass],
        })

        if (result.ok) {
            props.onSuccess(result.value)
            props.close()
        } else {
            console.error(result.error)
        }
    }

    return <Popup.BaseContainer>
        <Popup.BaseTitle
            title="Create Level"
            close={props.close}
        />

        <Form
            handler={handler}
            onSubmit={onSubmit}
            className="grid gap-7"
        >
            <FormInputField field={handler.fields.name} label="Name">
                <StringInput
                    field={handler.fields.name}
                    placeholder="Level Name"
                    autoFocus
                />
            </FormInputField>

            <FormButtons>
                <Button
                    theme={ButtonTheme.Primary}
                    type="submit"
                >
                    {
                        handler.loading ?
                            <Spinner /> :
                            'Create'
                    }
                </Button>
            </FormButtons>
        </Form>
    </Popup.BaseContainer>
}