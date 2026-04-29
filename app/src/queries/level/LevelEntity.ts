export type LevelEntity = {
    id: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    playbackId: string | null;
    serialized: string;
    duration: number;
};
