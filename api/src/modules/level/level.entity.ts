import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Document } from '../document/document.entity';

@Entity()
export class Level {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @RelationId((level: Level) => level.user)
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ type: 'text' })
  name!: string;

  @Column({ name: 'song_author', type: 'text' })
  song_author!: string;

  @Column({ name: 'song_name', type: 'text' })
  song_name!: string;

  @RelationId((level: Level) => level.playback)
  playbackId!: string | null;

  @ManyToOne(() => Document, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'playback_id' })
  playback!: Document | null;

  @Column({ type: 'text' })
  serialized!: string;
}
