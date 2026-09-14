import type { Result } from "@niloc/utils";
import type { Query } from "./Query";
import type { QueryContext } from "./QueryContext";

export type QueryResult = Result<any, Query.Error>

export type QueryHandler = (context: QueryContext, next: (context: QueryContext) => Promise<QueryResult>) => Promise<QueryResult>