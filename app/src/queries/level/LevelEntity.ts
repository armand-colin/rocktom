export type LevelEntity = {
    id: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    serialized: string;
    duration: number;
    instrumentTypes: string[];
    share: LevelEntity.Share | null;
};

export namespace LevelEntity {

    export type LevelSharePermission = 'read' | 'write';

    export type Share = {
        token: string;
        permission: LevelSharePermission;
        enabled: boolean;
    }

}