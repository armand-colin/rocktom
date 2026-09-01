import type { Component } from "@niloc/ecs";
import { useEffect, useState } from "react";

export function useComponent<T extends Component | null>(
    component: T
): T {
    const [_, forceUpdate] = useState(0)

    useEffect(() => {
        if (!component)
            return;

        function onChange() {
            forceUpdate(prev => prev + 1)
        }
        component.onChange(onChange)

        return () => {
            component.offChange(onChange)
        }
    }, [component])

    return component
}