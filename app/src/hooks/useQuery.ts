import { useEffect, useRef, useState } from "react";
import type { Query } from "../resources/queryClient/Query";
import type { QuerySpecification } from "../resources/queryClient/QuerySpecification";
import type { QueryResult } from "../resources/queryClient/QueryHandler";
import { nanoid } from "nanoid";

type Options<T extends QuerySpecification> = {
    enabled?: boolean,
    arguments: Query.RunArguments<T>
}

type Return<T extends QuerySpecification> = {
    isLoading: boolean,
    result: QueryResult<QuerySpecification.ResultOf<T>> | null,
    refresh: () => void,
}

type CurrentQuery = {
    id: string,
    abort: AbortController
}
export function useQuery<T extends QuerySpecification>(query: Query<T>, options: Options<T>): Return<T> {

    const { enabled = true } = options
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<QueryResult<QuerySpecification.ResultOf<T>> | null>(null)
    const currentQuery = useRef<CurrentQuery | null>(null)

    function onRefresh() {
        if (currentQuery.current) {
            currentQuery.current.abort.abort()
            currentQuery.current = null
        }

        setIsLoading(true)

        const id = nanoid(7)
        const abort = new AbortController()
        currentQuery.current = { id, abort }

        query.run({ ...options.arguments, signal: abort.signal })
            .then(result => {
                if (currentQuery.current?.id !== id)
                    return

                setResult(result)
            })
            .finally(() => {
                if (currentQuery.current?.id !== id)
                    return

                setIsLoading(false)
            })
    }

    useEffect(() => {
        if (enabled === false)
            return;

        onRefresh()
    }, [options.enabled, JSON.stringify(options.arguments)])

    useEffect(() => {
        if (enabled) {
            return;
        }

        if (currentQuery.current) {
            currentQuery.current.abort.abort()
            currentQuery.current = null
        }
    }, [enabled])

    useEffect(() => {
        return () => {
            if (currentQuery.current) {
                currentQuery.current.abort.abort()
                currentQuery.current = null
            }
        }
    }, [])

    return {
        isLoading,
        result,
        refresh: onRefresh,
    }

}