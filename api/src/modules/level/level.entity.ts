import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Document } from '../document/document.entity';
import { LevelShare } from './level-share.entity';
import { LevelAccess } from './level-access.entity';

@Entity("level")
export class Level {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text' })
  serialized!: string;

  @Column({ name: 'duration', type: 'integer' })
  duration!: number;

  @Column({ name: 'instrument_types', type: 'text', array: true })
  instrumentTypes!: string[];

  @Column({ name: 'playback_id', type: 'uuid', nullable: true })
  playbackId!: string | null;

  @ManyToOne(() => Document, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'playback_id' })
  playback!: Document | null;

  @OneToOne(() => LevelShare, share => share.levelId)
  share!: LevelShare | null;

  @ManyToMany(() => LevelAccess, (access) => access.levelId)
  access!: LevelAccess[];
}