import type { ReactNode } from "react"
import { Query } from "../../resources/queryClient/Query"
import type { StatusCode } from "../../resources/queryClient/StatusCode"

type Props = {
    error: Query.Error
    statusCodes?: Partial<Record<StatusCode, () => ReactNode>>,
    network?: () => ReactNode,
    default: () => ReactNode
}

export function FetchErrorView(props: Props) {
    const Default = props.default ?? (() => null) 
    
    if (props.error instanceof Query.CodeError) {
        if (props.statusCodes?.[props.error.statusCode]) {
            const Renderer = props.statusCodes[props.error.statusCode]!
            return <Renderer />
        }

        return <Default />
    }

    if (props.error instanceof Query.NetworkError) {
        if (props.network) {
            const Renderer = props.network!
            return <Renderer />
        }

        return <Default />
    }

    return <Default />
}