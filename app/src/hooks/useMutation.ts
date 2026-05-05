import { useEffect, useRef, useState } from "react"

export function useMutation<T, Args extends any[]>(mutation: (...args: Args) => Promise<T>) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [data, setData] = useState<T | null>(null)
    const disposedRef = useRef(false)

    useEffect(() => {
        return () => {
            disposedRef.current = true
        }
    }, [])

    return {
        isLoading,
        error,
        data,
        mutate: async (...args: Args) => {
            setIsLoading(true)
            setError(null)
            setData(null)

            try {
                const result = await mutation(...args)
                if (!disposedRef.current) {
                    console.log("result", result)
                    setData(result)
                }
            } catch (e: unknown) {
                if (!disposedRef.current) {
                    setError(e instanceof Error ? e : new Error(String(e)))
                }
            } finally {
                if (!disposedRef.current) {
                    setIsLoading(false)
                }
            }
        }
    }
}