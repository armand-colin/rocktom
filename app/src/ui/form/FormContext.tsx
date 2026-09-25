import { createContext } from "react"

export type FormContext = {
    loading: boolean
}

export const FormContext = createContext<FormContext>({
    loading: false,
})