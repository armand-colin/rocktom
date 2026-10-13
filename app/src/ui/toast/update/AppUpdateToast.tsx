import { FormSchema } from "../../../form/FormSchema"
import { useForm } from "../../../hooks/useForm"
import { useMutation } from "../../../hooks/useMutation"
import { SubmitButton } from "../../button/SubmitButton"
import { Form } from "../../form/Form"
import { Toast } from "../Toast"

const schema = FormSchema.default()

export function AppUpdateToast(props: {
    close: () => void,
    applyUpdate: () => Promise<void>
}) {
    const { mutate } = useMutation(() => {
        props.applyUpdate()
        return new Promise(() => { })
    })

    const handler = useForm(schema)

    return <Toast.Custom>
        <p>A new version is available !</p>
        <Form handler={handler} onSubmit={mutate}>
            <SubmitButton label="Update" />
        </Form>
    </Toast.Custom>
}