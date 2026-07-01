import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Level } from "./level.entity";
import { User } from "../user/user.entity";

@Entity("level_share")
export class LevelShare {
    @Column({ name: 'level_id', type: 'uuid' })
    levelId!: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId!: string;

    @ManyToOne(() => Level, { onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'level_id' })
    level!: Level;

    @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'user_id' })
    user!: User;
}