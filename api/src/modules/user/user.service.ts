import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository, TypeORMError } from 'typeorm';
import { User } from './user.entity';
import { TypeORMUtils } from '../../database/typeorm.utils';

// 5 minutes
const EMAIL_VALIDATION_CODE_EXPIRATION_MINUTES = 5;

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async register(body: { email: string }) {
    try {
      const user = await this.userRepository.create({
        email: body.email,
      });

      const createdUser = await this.userRepository.save(user);

      return createdUser.id;
    } catch (error) {
      if (TypeORMUtils.isConflictError(error)) {
        throw new ConflictException('email_already_exists');
      }
      throw error;
    }
  }

  tryGetUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.tryGetUserById(id);
    if (!user) {
      throw new NotFoundException('user_not_found');
    }
    return user;
  }

  tryGetUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.tryGetUserByEmail(email);
    if (!user) {
      throw new NotFoundException('user_not_found');
    }
    return user;
  }

  async setEmailValidationCode(user: User, code: string) {
    user.emailValidationCode = code;
    user.emailValidationCodeExpiresAt = new Date(Date.now() + EMAIL_VALIDATION_CODE_EXPIRATION_MINUTES * 60 * 1000);
    await this.userRepository.save(user);
  }

}
