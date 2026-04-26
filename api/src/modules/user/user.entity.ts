import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Session } from '../session/session.entity';

@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true, type: 'text' })
    email!: string;

    @Column({ name: 'email_validation_code', nullable: true, type: 'text' })
    emailValidationCode!: string | null;

    @Column({ name: 'email_validation_code_expires_at', nullable: true, type: 'timestamptz' })
    emailValidationCodeExpiresAt!: Date | null;

    @OneToMany(() => Session, (session) => session.user)
    sessions!: Session[];

}