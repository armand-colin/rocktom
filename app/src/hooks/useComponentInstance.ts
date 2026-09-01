import type { Component, ComponentConstructor } from "@niloc/ecs"
import { EngineContext } from "@niloc/ecs-react"
import { useContext, useEffect, useState } from "react"

export function useComponentInstance<T extends Component, Args extends unknown[]>(
    constructor: ComponentConstructor<T, Args>,
    ...args: Args
): T | null {
    const { engine } = useContext(EngineContext)
    const [instance, setInstance] = useState<T | null>(null)

    useEffect(() => {
        return () => {
            instance?.destroy()
        }
    }, [instance])

    useEffect(() => {
        return () => {
            setInstance(null)
        }
    }, [])

    useEffect(() => {
        const instance = engine.createComponent(constructor, ...args)
        setInstance(instance)
    }, [...args])

    return instance
}