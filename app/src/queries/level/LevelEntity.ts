import type { DocumentEntity } from "../document/DocumentEntity";

export type LevelEntity = {
    id: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    playbackId: string | null;
    playback: DocumentEntity | null;
    serialized: string;
    duration: number;
};
