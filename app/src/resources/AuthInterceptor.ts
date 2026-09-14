import { Result } from "@niloc/utils";
import { AuthManager } from "./AuthManager";
import { Query } from "./queryClient/Query";
import type { QueryInterceptor } from "./queryClient/QueryIntecteptor";

export namespace AuthInterceptor {

    export function create(authManager: AuthManager): QueryInterceptor {
        return {
            handle: async (context, next) => {
                const token = await authManager.getAccessToken()

                if (!token) {
                    return Result.error(new Query.UnauthorizedError())
                }

                context.setHeaders({
                    Authorization: `Bearer ${token}`
                })

                return next(context)
            }
        }
    }
}