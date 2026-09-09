import type { Body } from "./Body";
import type { QueryMethod } from "./QueryMethod";

export interface QueryContext {

    specifications: {
        method: QueryMethod,
        path: string,
    },
    arguments: {
        body: Body<any> | null,
        headers: Record<string, string>,
        search: Record<string, string | number>,
        path: Record<string, string>,
    }

}