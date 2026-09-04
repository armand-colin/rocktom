import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Level } from './level.entity';
import { User } from '../user/user.entity';

@Entity('level_access')
export class LevelAccess {
  @PrimaryColumn({ name: 'level_id', type: 'uuid' })
  levelId!: string;

  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => Level, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'level_id' })
  level!: Level;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @CreateDateColumn({ name: 'accepted_at', type: 'timestamptz' })
  acceptedAt!: Date;
}
