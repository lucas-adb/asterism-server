import type { User } from '@prisma/client';
import { compare } from 'bcryptjs';
import type { UsersRepository } from '../repositories/users-repository';
import { InvalidCredentialsError } from './errors/invalid-credentials-error';

type AuthUserRequest = {
  email: string;
  password: string;
};

type AuthUserResponse = {
  user: User;
};

export class AuthUserUseCase {
  protected readonly usersRepository: UsersRepository;

  constructor(usersRepository: UsersRepository) {
    this.usersRepository = usersRepository;
  }

  async execute({
    email,
    password,
  }: AuthUserRequest): Promise<AuthUserResponse> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const doesPasswordMatch = await compare(password, user.password_hash);

    if (!doesPasswordMatch) {
      throw new InvalidCredentialsError();
    }

    return { user };
  }
}
