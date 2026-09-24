import { FormSchema } from "../../form/FormSchema"
import { useForm } from "../../hooks/useForm"
import { Form } from "../form/Form"
import { SubmitButton } from "./SubmitButton"

export default {
    title: 'Button/SubmitButton',
}

const schema = FormSchema.default()

export const Default = () => {
    const handler = useForm(schema)

    async function onSubmit() {
        await new Promise(resolve => setTimeout(resolve, 2000))
    }

    return <div className="p-10">
        <Form handler={handler} onSubmit={onSubmit}>
            <SubmitButton label="Submit" />
        </Form>
    </div>
}