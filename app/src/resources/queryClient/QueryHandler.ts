import type { Result } from "@niloc/utils";
import type { Query } from "./Query";
import type { QueryContext } from "./QueryContext";

export type QueryResult<T> = Result<T, Query.Error>

export type QueryHandler<T> = (context: QueryContext, next: (context: QueryContext) => Promise<QueryResult<T>>) => Promise<QueryResult<T>>