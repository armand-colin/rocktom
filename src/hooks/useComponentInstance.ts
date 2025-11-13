import type { Component, ComponentConstructor } from "@niloc/ecs"
import { EngineContext } from "@niloc/ecs-react"
import { useContext, useEffect, useState } from "react"

export function useComponentInstance<T extends Component, Args extends unknown[]>(
    constructor: ComponentConstructor<T, Args>,
    ...args: Args
): T {
    const { engine } = useContext(EngineContext)
    const [instance] = useState(() => engine.createComponent(constructor, ...args))

    useEffect(() => {
        return () => {
            instance.destroy()
        }
    }, [engine, instance])

    return instance
}