import type { ReactNode } from "react"
import { FetchError } from "../../resources/fetch/FetchError"
import type { StatusCode } from "../../resources/fetch/StatusCode"

type Props = {
    error: FetchError
    statusCodes?: Partial<Record<StatusCode, () => ReactNode>>,
    network?: () => ReactNode,
    default: () => ReactNode
}

export function FetchErrorView(props: Props) {
    const Default = props.default ?? (() => null) 
    
    if (props.error instanceof FetchError.StatusCode) {
        if (props.statusCodes?.[props.error.statusCode]) {
            const Renderer = props.statusCodes[props.error.statusCode]!
            return <Renderer />
        }

        return <Default />
    }

    if (props.error instanceof FetchError.Network) {
        if (props.network) {
            const Renderer = props.network!
            return <Renderer />
        }

        return <Default />
    }

    return <Default />
}