import { FormField } from "../../form/FormField";
import type { FormHandler } from "../../form/FormHandler";
import { FormSchema } from "../../form/FormSchema";
import { useForm } from "../../hooks/useForm";
import type { LevelEntity } from "../../queries/level/LevelEntity";
import { LevelQueries } from "../../queries/level/LevelQueries";
import { Button } from "../button/Button";
import { Form } from "../form/Form";
import { FormInputField } from "../form/FormInputField";
import { StringInput } from "../input/StringInput";
import { Popup } from "../popup/Popup";

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
        const result = await LevelQueries.create(e.json.name)
        if (result.ok) {
            props.onSuccess(result.value)
            props.close()
        } else {
            console.error(result.error)
        }
    }

    return <Popup
        title="Create Level"
        close={props.close}
    >
        <Form handler={handler} onSubmit={onSubmit}>
            <FormInputField field={handler.fields.name} label="Name">
                <StringInput field={handler.fields.name} placeholder="Level Name" />
            </FormInputField>
            <Button>Create</Button>
        </Form>
    </Popup>
}