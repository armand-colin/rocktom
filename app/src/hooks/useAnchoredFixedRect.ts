import { useLayoutEffect, useState, type CSSProperties, type RefObject } from "react"

export function useAnchoredFixedRect(
    elementRef: RefObject<HTMLElement | null>,
    active: boolean,
): CSSProperties | undefined {
    const [, setTick] = useState(0)

    useLayoutEffect(() => {
        if (!active)
            return

        const element = elementRef.current
        if (!element)
            return

        function update() {
            setTick(tick => tick + 1)
        }

        update()

        window.addEventListener("resize", update)
        window.addEventListener("scroll", update, true)

        const resizeObserver = new ResizeObserver(update)
        resizeObserver.observe(element)

        return () => {
            window.removeEventListener("resize", update)
            window.removeEventListener("scroll", update, true)
            resizeObserver.disconnect()
        }
    }, [active, elementRef])

    if (!active)
        return undefined

    const element = elementRef.current
    if (!element)
        return undefined

    const rect = element.getBoundingClientRect()
    return {
        "--anchor-x": rect.left,
        "--anchor-y": rect.top,
        "--anchor-w": rect.width,
        "--anchor-h": rect.height,
    } as CSSProperties
}
