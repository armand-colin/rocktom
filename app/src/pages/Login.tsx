import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { StringInput } from "../ui/input/StringInput"
import { Button } from "../ui/button/Button"
import { usePopupManager } from "../hooks/usePopupManager"
import { Popup } from "../ui/popup/Popup"

type Tokens = {
    accessToken: string,
    refreshToken: string,
}

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
                    onSuccess={(tokens) => {
                        console.log(tokens)
                        navigate('/')
                    }}
                /> : null
        }
    </div>
}

function EmailForm(props: { email?: string, onSuccess: (email: string) => void }) {
    const [email, setEmail] = useState<string>(props.email ?? '');
    const popupManager = usePopupManager()

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const email = formData.get("email") as string

        const response = await fetch(`${import.meta.env.VITE_API_URL}/session/code`, {
            method: 'POST',
            body: JSON.stringify({ email }),
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const error = await response.json()
            const code = error.message

            let message = 'Failed to ask for code'
            switch (code) {
                case 'user_not_found':
                    message = 'User not found'
                    break
                default:
                    message = 'Failed to ask for code'
                    break
            }
            popupManager.add(close => <Popup title="Login failed" close={close}>
                <p>{message}</p>
            </Popup>)
            return
        }

        props.onSuccess(email)
    }

    return <form onSubmit={onSubmit}>
        <StringInput
            name="email"
            type="email"
            value={email}
            onChange={setEmail}
        />
        <Button>Submit</Button>

        <a href='/register'>Register</a>
    </form>
}

function CodeForm(props: { email: string, onSuccess: (tokens: Tokens) => void }) {
    const [code, setCode] = useState<string>('');
    const popupManager = usePopupManager()

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const code = formData.get("code") as string

        const response = await fetch(`${import.meta.env.VITE_API_URL}/session/login`, {
            method: 'POST',
            body: JSON.stringify({ email: props.email, code }),
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const error = await response.json()
            const code = error.message
            let message = 'Failed to login'

            switch (code) {
                case 'invalid_code':
                    message = 'Invalid code'
                    break
                default:
                    message = 'Failed to login'
                    break
            }
            
            popupManager.add(close => <Popup 
                title="Login failed"
                close={close}
            >
                <p>{message}</p>
            </Popup>)
            return
        }

        const tokens = await response.json() as Tokens

        props.onSuccess(tokens)
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