export interface Handler {

    destroy(): void

}

export namespace Handler {
    export function compose(handlers: Handler[]): Handler {
        return {
            destroy() {
                for (const handler of handlers) {
                    handler.destroy()
                }
            }
        }
    }
}