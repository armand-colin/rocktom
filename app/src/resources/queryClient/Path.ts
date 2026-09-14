import { Result } from "@niloc/utils";
import { Enum } from "../../utils/Enum";

export class Path<P extends string> {

    private readonly _segments: Path.Segment[]
    readonly path: P

    constructor(path: P) {
        this.path = path;

        // Create segments
        const segments: Path.Segment[] = [];

        const parts = path.split('/');

        for (let part of parts) {
            part = part.trim()
            if (part === '')
                continue;

            if (part.startsWith(':')) {
                segments.push({
                    type: Path.SegmentType.Argument,
                    value: part.slice(1)
                })
            } else {
                segments.push({
                    type: Path.SegmentType.String,
                    value: part
                })
            }
        }

        this._segments = segments;
    }

    compile(args: Path.Arguments<P>): Result<string, Path.CompileError> {
        let compiled = ''
        
        for (const segment of this._segments) {
            if (segment.type === Path.SegmentType.Argument) {
                const value = (args as any)[segment.value]
                
                if (
                    value === undefined || 
                    value === null
                ) {
                    return Result.error(new Path.CompileError(this.path, segment.value))
                }

                compiled += "/" + encodeURI(value)
            } else {
                compiled += "/" + segment.value
            }
        }

        return Result.ok(compiled)
    }

}

export namespace Path {

    export const SegmentType = Enum.create({
        String: 0,
        Argument: 1
    })

    export type SegmentType = Enum.Infer<typeof SegmentType>

    export type Segment = {
        type: SegmentType
        value: string
    }

    type _Arguments<P extends string> =
        P extends `:${infer Rest}` ?
        Rest extends `${infer ArgName}/${infer Rest}` ?
        Record<ArgName, string> & Arguments<Rest> :
        Record<Rest, string> :
        P extends `${infer _}/:${infer Rest}` ?
        Arguments<`:${Rest}`> :
        {}

    type Flatten<T> = {
        [key in keyof T]: T[key]
    }

    export type Arguments<P extends string> = Flatten<_Arguments<P>>

    export class CompileError extends Error {

        constructor(path: string, missingSegment: string) {
            const message = `Missing path argument '${missingSegment}' for path '${path}'`
            super(message)
        }

    }

}