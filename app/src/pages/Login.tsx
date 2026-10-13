import './Login.scss'
import { useCallback, useRef, useState } from "react"
import { StringInput } from "../ui/input/StringInput"
import { usePopupManager } from "../hooks/usePopupManager"
import { IconPopup } from "../ui/iconPopup/IconPopup"
import { AuthManager } from "../resources/AuthManager"
import { Instance } from "../Instance"
import { FormSchema } from "../form/FormSchema"
import { useForm } from "../hooks/useForm"
import { Form } from "../ui/form/Form"
import { FormField } from "../form/FormField"
import type { FormHandler } from "../form/FormHandler"
import { FormInputField } from '../ui/form/FormInputField'
import { FormButtons } from '../ui/formButtons/FormButtons'
import { Query } from '../resources/queryClient/Query'
import { SubmitButton } from '../ui/button/SubmitButton'
import { Link } from 'react-router-dom'
import { Routes } from '../Routes'
import { Stepper } from '../ui/stepper/Stepper'
import { OTPInput, type OTPInputRef } from '../ui/input/otp/OTPInput'

enum LoginStep {
    Email,
    Code,
}

export function Login() {
    const [username, setUsername] = useState<string | null>(null)
    const [step, setStep] = useState<LoginStep>(LoginStep.Email)

    return <div className="Login">
        <div>
            <h1>Login</h1>
            <Stepper<LoginStep>
                step={step}
                className='w-full min-h-fit'
                stepClassName='min-h-fit'
                steps={[
                    {
                        step: LoginStep.Email,
                        render: () => <EmailForm
                            onSuccess={(username: string) => {
                                setUsername(username)
                                setStep(LoginStep.Code)
                            }}
                        />
                    },
                    {
                        step: LoginStep.Code,
                        render: () => <CodeForm
                            username={username!}
                            onSuccess={() => {
                                setStep(LoginStep.Email)
                            }}
                            onBack={() => setStep(LoginStep.Email)}
                        />
                    }
                ]}
            />
        </div>
    </div>
}

const EmailFormSchema = new FormSchema({
    username: FormField.string().min(1)
})

function EmailForm(props: { username?: string, onSuccess: (username: string) => void }) {
    const popupManager = usePopupManager()
    const formHandler = useForm(EmailFormSchema)

    async function onSubmit(e: FormHandler.Result<typeof EmailFormSchema>) {
        const authManager = Instance.engine.getResource(AuthManager)

        const result = await authManager.requestCode(e.json.username)

        if (result.ok) {
            props.onSuccess(e.json.username)
            return
        }

        const error = result.error

        let errorMessage = 'Failed to ask for code'

        if (error instanceof Query.CodeError) {
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

        popupManager.add(close => <IconPopup
            title="Login failed"
            icon="close"
            text={errorMessage}
            close={close}
        />)
    }

    return <Form
        handler={formHandler}
        onSubmit={onSubmit}
        className='grid gap-7'
    >
        <FormInputField field={formHandler.fields.username} label="Username or email">
            <StringInput
                field={formHandler.fields.username}
                placeholder="Username or email"
            />
        </FormInputField>

        <a href='/register'>Don't have an account yet ? Register</a>

        <FormButtons>
            <SubmitButton
                label="Submit"
                className="w-full max-w-25"
            />
        </FormButtons>
    </Form>
}

const CodeFormSchema = new FormSchema({
    code: FormField.string().min(6).max(6)
})

function CodeForm(props: { username: string, onSuccess: () => void, onBack?: () => void }) {
    const handler = useForm(CodeFormSchema)
    const ref = useRef<HTMLFormElement>(null)
    const [error, setError] = useState<string | null>(null)
    const otpRef = useRef<OTPInputRef>(null)

    async function onSubmit(e: FormHandler.Result<typeof CodeFormSchema>) {
        const authManager = Instance.engine.getResource(AuthManager)
        const result = await authManager.login(props.username, e.json.code)

        if (result.ok) {
            props.onSuccess()
            return
        }

        const error = result.error

        let errorMessage = 'Failed to login'

        if (error instanceof Query.CodeError) {
            const code = (await error.response.json()).message

            switch (code) {
                case 'invalid_code':
                    errorMessage = 'Invalid code'
                    break
                default:
                    errorMessage = 'Failed to login'
                    break
            }
        }

        otpRef.current?.clear()
        setError(errorMessage)
    }

    const onComplete = useCallback(() => {
        ref.current?.requestSubmit()
    }, [])

    return <Form
        handler={handler}
        onSubmit={onSubmit}
        ref={ref}
        onChange={() => setError(null)}
        className='grid gap-7'
    >
        <p>Enter the code sent to your email</p>

        <FormInputField
            field={handler.fields.code}
            hideLabel
            error={error}
        >
            <OTPInput
                length={6}
                field={handler.fields.code}
                onComplete={onComplete}
                ref={otpRef}
            />
        </FormInputField>

        <Link to={Routes.Login.compile({})} onClick={() => props.onBack?.()}>
            Go back to login page
        </Link>

        <FormButtons>
            <SubmitButton
                label='Submit'
                className='max-w-25 w-full'
            />
        </FormButtons>
    </Form>
}