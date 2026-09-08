import { Enum } from "@niloc/utils";

export const QueryMethod = Enum.create({
    Get: 'GET',
    Post: 'POST',
    Put: 'PUT',
    Delete: 'DELETE',
    Patch: 'PATCH',
})

export type QueryMethod = Enum.Infer<typeof QueryMethod>