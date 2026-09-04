import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Level } from './level.entity';

export type LevelSharePermission = 'read' | 'write';

@Entity('level_share')
export class LevelShare {
  @PrimaryColumn({ name: 'level_id', type: 'uuid' })
  levelId!: string;

  @OneToOne(() => Level, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'level_id' })
  level!: Level;

  @Column({ type: 'text', unique: true })
  token!: string;

  @Column({ type: 'text' })
  permission!: LevelSharePermission;

  @Column({ type: 'boolean', default: true })
  enabled!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
