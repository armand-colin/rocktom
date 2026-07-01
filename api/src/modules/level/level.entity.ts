import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Document } from '../document/document.entity';

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

  @Column({ name: 'playback_id', type: 'uuid', nullable: true })
  playbackId!: string | null;

  @ManyToOne(() => Document, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'playback_id' })
  playback!: Document | null;

  @Column({ name: 'share_code', type: 'text', nullable: true, select: false })
  shareCode!: string | null;
}