import './Login.scss'
import { useNavigate } from "react-router-dom"
import { StringInput } from "../ui/input/StringInput"
import { Button } from "../ui/button/Button"
import { FormSchema } from "../form/FormSchema"
import { FormField } from "../form/FormField"
import { useForm } from "../hooks/useForm"
import { Form } from "../ui/form/Form"
import type { FormHandler } from "../form/FormHandler"
import { FormInputField } from "../ui/form/FormInputField"
import { usePopupManager } from "../hooks/usePopupManager"
import { IconPopup } from "../ui/iconPopup/IconPopup"
import { StatusCodeError } from "../resources/fetch/StatusCodeError"
import { UserQueries } from "../queries/user/UserQueries"

const RegisterFormSchema = new FormSchema({
    email: FormField.email(),
    username: FormField.string().min(1)
})

export function Register() {
    const navigate = useNavigate()
    const popupManager = usePopupManager()
    const formHandler = useForm(RegisterFormSchema)

    async function onSubmit(e: FormHandler.Result<typeof RegisterFormSchema>) {
        const result = await UserQueries.register(e.json.email, e.json.username)

        if (result.ok) {
            navigate('/login')
            return
        }

        let errorMessage = 'Failed to register user'
        const error = result.error

        if (error instanceof StatusCodeError) {
            const code = (await error.response.json()).message

            switch (code) {
                case 'user_already_exists':
                    errorMessage = 'User already exists'
                    break
                default:
                    errorMessage = 'Failed to register user'
                    break
            }
        }

        popupManager.add(close => <IconPopup
            title="Register failed"
            icon="close"
            text={errorMessage}
            close={close}
        />)
    }

    return <div className="Login">
        <div>
            <h1>Register</h1>
            <Form handler={formHandler} onSubmit={onSubmit}>
                <FormInputField field={formHandler.fields.username} label="Username">
                    <StringInput
                        field={formHandler.fields.username}
                        placeholder="Username"
                    />
                </FormInputField>
                <FormInputField field={formHandler.fields.email} label="Email">
                    <StringInput
                        field={formHandler.fields.email}
                        type="email"
                        placeholder="Email"
                    />
                </FormInputField>
                <Button>Register</Button>
                <a href="/login">Login</a>
            </Form>
        </div>
    </div>
}