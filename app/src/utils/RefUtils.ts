import type { Ref } from "react";

export namespace RefUtils {

    export function forward<T>(ref: Ref<T> | undefined, element: T | null) {
        if (!ref)
            return

        if (typeof ref === "function") {
            ref(element)
        } else {
            ref.current = element
        }
    }

}