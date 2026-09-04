export type LevelEntity = {
    id: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    serialized: string;
    duration: number;
    instrumentTypes: string[];
};

export namespace LevelEntity {
    export type Share = {
        token: string;
    }
}