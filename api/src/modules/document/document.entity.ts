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

@Entity("document")
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @RelationId((document: Document) => document.user)
  userId!: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user!: User | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ type: 'text' })
  filename!: string;

  @Column({ type: 'text' })
  extension!: string;

  @Column({ type: 'integer' })
  size!: number;
}

