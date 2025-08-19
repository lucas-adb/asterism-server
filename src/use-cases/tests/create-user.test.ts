import { compare } from 'bcryptjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';
import { CreateUserUseCase } from '../create-user';
import { UserAlreadyExistsError } from '../errors/user-already-exists-error';

let repository: InMemoryUsersRepository;
let sut: CreateUserUseCase;

describe('Create User', () => {
  beforeEach(() => {
    repository = new InMemoryUsersRepository();
    sut = new CreateUserUseCase(repository);
  });

  it('creates user', async () => {
    const data = {
      username: 'Testing Joe',
      email: 'test@mail.com',
      password: '123456',
    };

    const { user } = await sut.execute(data);

    expect(user.id).toEqual(expect.any(String));
  });

  it('hashes password', async () => {
    const data = {
      username: 'Testing Joe',
      email: 'test@mail.com',
      password: '123456',
    };

    const { user } = await sut.execute(data);

    const isPasswordHashed = await compare('123456', user.password_hash);

    expect(isPasswordHashed).toBe(true);
  });

  it('can not create two users with same email', async () => {
    const data = {
      username: 'Testing Joe',
      email: 'test@mail.com',
      password: '123456',
    };

    await sut.execute(data);

    await expect(async () => {
      await sut.execute(data);
    }).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });
});
