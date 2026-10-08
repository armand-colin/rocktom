import { Path } from "./resources/queryClient/Path"

export interface Route<P extends string = string> {
    raw: P,
    path: Path<P>,
    isAuthenticated: boolean,
    match(pathname: string): boolean,
    compile(args: Path.Arguments<P>, search?: Record<string, string>): string
}

export namespace Route {

    function match(path: string) {
        return (pathname: string) => {
            // TODO: make it better to match ":id" arguments
            return pathname === path
        }
    }

    export function create<P extends string>(path: P, opts?: { isAuthenticated?: boolean }): Route<P> {
        const realPath = new Path(path)

        return {
            raw: path,
            path: realPath,
            isAuthenticated: opts?.isAuthenticated ?? true,
            match: match(path),
            compile: (args, search) => {
                let path = realPath.compile(args).unwrap()
                const searchParams = new URLSearchParams()
                if (search) {
                    for (const [key, value] of Object.entries(search)) {
                        searchParams.set(key, value)
                    }
                }
                
                if (searchParams.size > 0) {
                    path += '?' + searchParams.toString()
                }

                return path
            }
        }
    }

}

export const Routes = {

    Home: Route.create("/app"),
    Settings: Route.create("/app/settings"),
    Editor: Route.create("/editor/level/:id"),
    Level: Route.create("/app/level/:id/:index"),
    AcceptLevelShare: Route.create("/app/share/:token"),

    Register: Route.create("/register", { isAuthenticated: false }),
    Login: Route.create("/login", { isAuthenticated: false }),

}