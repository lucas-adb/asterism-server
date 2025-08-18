import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';
import { CreateUserUseCase } from '../create-user';

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

    const { user } = await sut.create(data);

    expect(user.id).toEqual(expect.any(String));
  });
});
