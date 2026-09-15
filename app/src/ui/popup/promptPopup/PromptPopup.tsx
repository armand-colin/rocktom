import { FormField } from "../../../form/FormField";
import type { FormHandler } from "../../../form/FormHandler";
import { FormSchema } from "../../../form/FormSchema";
import { useForm } from "../../../hooks/useForm";
import { Button, ButtonTheme } from "../../button/Button";
import { Form } from "../../form/Form";
import { FormButtons } from "../../formButtons/FormButtons";
import { StringInput } from "../../input/StringInput";
import { Popup } from "../Popup";

interface Props {
    close: () => void,
    text: string,
    defaultValue?: string,
    onConfirm: (value: string) => void,
    title?: string,
    placeholder?: string,
    confirmLabel?: string,
    cancelLabel?: string,
}

const schema = new FormSchema({
    value: FormField.string(),
})

export function PromptPopup(props: Props) {
    const handler = useForm(schema)

    function onSubmit(e: FormHandler.Result<typeof schema>) {
        props.onConfirm(e.json.value)
        props.close()
    }

    return <Popup.BaseContainer>
        {
            props.title ?
                <Popup.BaseTitle
                    title={props.title}
                    close={props.close}
                /> :
                null
        }
        <p>{props.text}</p>

        <Form handler={handler} onSubmit={onSubmit} className="grid gap-7">
            <StringInput
                field={handler.fields.value}
                defaultValue={props.defaultValue}
                autoFocus
                placeholder={props.placeholder}
            />
            <FormButtons>
                <Button onClick={props.close}>
                    {props.cancelLabel || "Cancel"}
                </Button>
                <Button
                    type="submit"
                    theme={ButtonTheme.Primary}
                >
                    {props.confirmLabel || "Confirm"}
                </Button>
            </FormButtons>
        </Form>
    </Popup.BaseContainer >
}
