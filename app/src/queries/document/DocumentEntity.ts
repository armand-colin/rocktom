export type DocumentEntity = {
    id: string,
    userId: string | null,
    filename: string,
    extension: string,
    size: number,
    duration: number | null,
    createdAt: string,
    updatedAt: string,
}