import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { StringInput } from "../ui/input/StringInput"
import { Button } from "../ui/button/Button"

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
            throw new Error('Failed to ask for code')
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
    </form>
}

function CodeForm(props: { email: string, onSuccess: (tokens: Tokens) => void }) {
    const [code, setCode] = useState<string>('');

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
            throw new Error('Failed to login')
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