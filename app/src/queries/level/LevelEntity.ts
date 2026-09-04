import { Enum } from "../../utils/Enum";

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

    export const SharePermission = Enum.create({
        Read: 'read',
        Write: 'write',
    })
    export type SharePermission = Enum.Infer<typeof SharePermission>;

    export type Share = {
        token: string;
        permission: SharePermission;
        enabled: boolean;
    }

    export type SharePreview = {
        user: {
            name: string;
        },
        name: string;
        instrumentTypes: string[];
        duration: number;
        share: {
            permission: SharePermission;
        }
    }
}