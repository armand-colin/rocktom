import type { QueryClient } from "./QueryClient"
import type { QuerySpecification } from "./QuerySpecification";

export class Query<T extends QuerySpecification> {

    private _specifications: T

    constructor(readonly queryClient: QueryClient, specifications: T) {
        this._specifications = specifications
    }

    run(options: QuerySpecification.RunArguments<T>) {
        // TODO: Implement the query execution logic
    }

}