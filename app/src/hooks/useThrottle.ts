import { useEffect, useRef } from "react"
import { Throttle } from "../utils/Throttle"

export function useThrottle(frequency: number) {
    const throttle = useRef<Throttle | null>(null)

    useEffect(() => {
        return () => {
            throttle.current?.clear()
        }
    }, [])

    useEffect(() => {
        throttle.current?.setFrequency(frequency)
    }, [frequency])

    return {
        call: (fn: () => void) => {
            if (!throttle.current) {
                throttle.current = new Throttle(frequency)
            }
            throttle.current.call(fn)
        },
        clear: () => {
            throttle.current?.clear()
        }
    }
}