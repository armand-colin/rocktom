import { useEffect, useState } from "react"
import { Lifetime } from "../utils/Lifetime"

export function useLifetime(): Lifetime | null {
    const [lifetime, setLifetime] = useState<Lifetime | null>(null)

    useEffect(() => {
        if (lifetime)
            return;

        const newLifetime = new Lifetime()
        setLifetime(newLifetime)

        return () => {
            newLifetime.unmount()
        }
    }, [lifetime])

    return lifetime
}