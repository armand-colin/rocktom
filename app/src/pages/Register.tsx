import type { FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { StringInput } from "../ui/input/StringInput"
import { Button } from "../ui/button/Button"

export function Register() {
    const navigate = useNavigate()

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const email = formData.get("email") as string

        const response = await fetch(import.meta.env.VITE_API_URL + '/user/register', {
            body: JSON.stringify({ email }),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            throw new Error('Failed to register user')
        }

        // Shall route to login
        navigate('/login')
    }

    return <div>
        <h1>Register</h1>

        <form onSubmit={onSubmit}>
            <StringInput
                name="email"
                type="email"
                placeholder="Email"
            />
            <Button>Register</Button>
        </form>
    </div>
}