import type { FormEvent } from "react"

export function Register() {

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

        const data = await response.json()
        console.log(data)
    }

    return <div>
        <h1>Register</h1>

        <form onSubmit={onSubmit}>
            <input type="email" placeholder="Email" />

            <button>Register</button>
        </form>
    </div>
}