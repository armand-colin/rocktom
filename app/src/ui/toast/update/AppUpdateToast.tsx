import { FormSchema } from "../../../form/FormSchema"
import { useForm } from "../../../hooks/useForm"
import { SubmitButton } from "../../button/SubmitButton"
import { Form } from "../../form/Form"
import { Toast } from "../Toast"

const schema = FormSchema.default()

export function AppUpdateToast(props: {
    close: () => void,
    applyUpdate: () => Promise<void>
}) {
    const handler = useForm(schema)

    return <Toast.Custom>
        <p>A new version is available !</p>
        <Form handler={handler} onSubmit={props.applyUpdate}>
            <SubmitButton label="Update" />
        </Form>
    </Toast.Custom>
}