export namespace Path {
    
    class Compiled<T extends string> {

        readonly path: T
        private _arguments: string[]

        constructor(path: T) {

        }

    }

}