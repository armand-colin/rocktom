import type { Component, ComponentConstructor } from "@niloc/ecs"
import { EngineContext } from "@niloc/ecs-react"
import { useContext, useEffect, useRef } from "react"

export function useComponentInstance<T extends Component, Args extends unknown[]>(
    constructor: ComponentConstructor<T, Args>,
    ...args: Args
): T {
    const { engine } = useContext(EngineContext)
    const instance = useRef<T | null>(null)

    useEffect(() => {
        if (instance.current) {
            instance.current.destroy()
            instance.current = engine.createComponent(constructor, ...args)
        }

        return () => {
            instance.current?.destroy()
            instance.current = null
        }
    }, [...args])

    if (instance.current === null)
        instance.current = engine.createComponent(constructor, ...args)

    return instance.current
}