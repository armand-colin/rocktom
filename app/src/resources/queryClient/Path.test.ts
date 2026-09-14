import { describe, expect, it } from "vitest";
import { Path } from "./Path";
import { Result } from "@niloc/utils";

describe('Path', () => {

    function unwrap<T>(result: Result<T, any>): T {
        if (result.ok) {
            return result.value
        }

        throw result.error
    }

    it('should compile simple path', () => {
        const path = new Path('/users/test')
        const result = path.compile({ })
        expect(result.ok).toBe(true)
        expect(unwrap(result)).toBe('/users/test')
    })

})