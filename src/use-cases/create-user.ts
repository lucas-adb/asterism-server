import type { User } from '@prisma/client';
import { hash } from 'bcryptjs';
import type { UsersRepository } from '../repositories/users-repository';
import { UserAlreadyExistsError } from './errors/user-already-exists-error';

export type CreateUserUseCaseRequest = {
  username: string;
  email: string;
  password: string;
};

type CreateUserUseCaseResponse = {
  user: User;
};

export class CreateUserUseCase {
  private readonly usersRepository: UsersRepository;

  constructor(usersRepository: UsersRepository) {
    this.usersRepository = usersRepository;
  }

  async execute({
    username,
    email,
    password,
  }: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponse> {
    const saltNumber = 6;
    const password_hash = await hash(password, saltNumber);

    const userWithSameEmail = await this.usersRepository.findByEmail(email);

    if (userWithSameEmail) {
      throw new UserAlreadyExistsError();
    }

    const user = await this.usersRepository.create({
      username,
      email,
      password_hash,
    });

    return { user };
  }
}
