import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { StringInput } from "../ui/input/StringInput"
import { Button } from "../ui/button/Button"
import { usePopupManager } from "../hooks/usePopupManager"
import { Popup } from "../ui/popup/Popup"
import { AuthManager } from "../resources/AuthManager"
import { StatusCodeError } from "../resources/fetch/StatusCodeError"
import { Instance } from "../Instance"
import { FormSchema, type FormResult } from "../form/FormSchema"
import { useForm } from "../hooks/useForm"
import { Form } from "../ui/form/Form"

enum LoginStep {
    Email,
    Code,
}

export function Login() {
    const [email, setEmail] = useState<string | null>(null)
    const [step, setStep] = useState<LoginStep>(LoginStep.Email)

    const navigate = useNavigate()

    return <div>
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
}

const EmailFormSchema = new FormSchema({
    email: 'string'
})

function EmailForm(props: { email?: string, onSuccess: (email: string) => void }) {
    const popupManager = usePopupManager()
    const formHandler = useForm(EmailFormSchema)

    async function onSubmit(e: FormResult<typeof EmailFormSchema>) {
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
        <StringInput
            name="email"
            type="email"
        />
        <Button>Submit</Button>

        <a href='/register'>Register</a>
    </Form>
}

function CodeForm(props: { email: string, onSuccess: () => void }) {
    const [code, setCode] = useState<string>('');
    const popupManager = usePopupManager()

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()

        const formData = new FormData(e.target as HTMLFormElement)
        const code = formData.get("code") as string

        const authManager = Instance.engine.getResource(AuthManager)

        const result = await authManager.login(props.email, code)

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

    return <form onSubmit={onSubmit}>
        <StringInput
            name="code"
            value={code}
            onChange={setCode}
        />
        <Button>Submit</Button>
    </form>
}