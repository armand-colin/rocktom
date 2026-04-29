import './Login.scss'
import { useState } from "react"
import { StringInput } from "../ui/input/StringInput"
import { Button } from "../ui/button/Button"
import { usePopupManager } from "../hooks/usePopupManager"
import { Popup } from "../ui/popup/Popup"
import { AuthManager } from "../resources/AuthManager"
import { StatusCodeError } from "../resources/fetch/StatusCodeError"
import { Instance } from "../Instance"
import { FormSchema } from "../form/FormSchema"
import { useForm } from "../hooks/useForm"
import { Form } from "../ui/form/Form"
import { FormField } from "../form/FormField"
import type { FormHandler } from "../form/FormHandler"
import { FormInputField } from '../ui/form/FormInputField'

enum LoginStep {
    Email,
    Code,
}

export function Login() {
    const [email, setEmail] = useState<string | null>(null)
    const [step, setStep] = useState<LoginStep>(LoginStep.Email)

    return <div className="Login">
        <div>
        <h1>Login</h1>
        {
            step === LoginStep.Email ? <EmailForm
                onSuccess={(email: string) => {
                    setEmail(email)
                    setStep(LoginStep.Code)
                }}
            /> :
                step === LoginStep.Code ? <CodeForm
                    email={email!}
                    onSuccess={() => {

                    }}
                /> : null
        }
        </div>
    </div>
}

const EmailFormSchema = new FormSchema({
    email: FormField.email()
})

function EmailForm(props: { email?: string, onSuccess: (email: string) => void }) {
    const popupManager = usePopupManager()
    const formHandler = useForm(EmailFormSchema)

    async function onSubmit(e: FormHandler.Result<typeof EmailFormSchema>) {
        const authManager = Instance.engine.getResource(AuthManager)

        const result = await authManager.requestCode(e.json.email)

        if (result.ok) {
            props.onSuccess(e.json.email)
            return
        }

        const error = result.error

        let errorMessage = 'Failed to ask for code'

        if (error instanceof StatusCodeError) {
            const code = (await error.response.json()).message

            switch (code) {
                case 'user_not_found':
                    errorMessage = 'User not found'
                    break
                default:
                    errorMessage = 'Failed to ask for code'
                    break
            }
        }

        popupManager.add(close => <Popup title="Login failed" close={close}>
            <p>{errorMessage}</p>
        </Popup>)
    }

    return <Form handler={formHandler} onSubmit={onSubmit}>
        <FormInputField field={formHandler.fields.email} label="Email">
        <StringInput
            field={formHandler.fields.email}
            placeholder="Email"
        />
        </FormInputField>
        <Button>Submit</Button>

        <a href='/register'>Register</a>
    </Form>
}

const CodeFormSchema = new FormSchema({
    code: FormField.string().min(6).max(6)
})

function CodeForm(props: { email: string, onSuccess: () => void }) {
    const popupManager = usePopupManager()

    const formHandler = useForm(CodeFormSchema)

    async function onSubmit(e: FormHandler.Result<typeof CodeFormSchema>) {
        const authManager = Instance.engine.getResource(AuthManager)

        const result = await authManager.login(props.email, e.json.code)

        if (result.ok) {
            props.onSuccess()
            return
        }

        const error = result.error

        let errorMessage = 'Failed to login'

        if (error instanceof StatusCodeError) {
            const code = (await error.response.json()).message

            switch (code) {
                case 'invalid_code':
                    errorMessage = 'Invalid code'
                    break
                default:
                    errorMessage = 'Failed to login'
                    break
            }

            return
        }

        popupManager.add(close => <Popup
            title="Login failed"
            close={close}
        >
            <p>{errorMessage}</p>
        </Popup>)
    }

    return <Form handler={formHandler} onSubmit={onSubmit}>
        <p>Enter the code sent to your email</p>

        <StringInput
            field={formHandler.fields.code}
            name="code"
            placeholder="XXXXXX"
        />

        <Button>Submit</Button>
    </Form>
}