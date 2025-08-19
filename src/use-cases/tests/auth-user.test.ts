import { hash } from 'bcryptjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';
import { AuthUserUseCase } from '../auth-user';
import { InvalidCredentialsError } from '../errors/invalid-credentials-error';

let repository: InMemoryUsersRepository;
let sut: AuthUserUseCase;

describe('Auth User', () => {
  beforeEach(() => {
    repository = new InMemoryUsersRepository();
    sut = new AuthUserUseCase(repository);
  });

  it('auths user', async () => {
    const saltNumber = 6;
    const password = '123456';

    const data = {
      username: 'Testing Joe',
      email: 'test@mail.com',
      password_hash: await hash(password, saltNumber),
    };

    await repository.create(data);

    const { user } = await sut.execute({
      email: data.email,
      password,
    });

    expect(user.id).toEqual(expect.any(String));
    expect(user).toEqual(expect.objectContaining(data));
  });

  it('throws error when using wrong email', async () => {
    await expect(async () => {
      await sut.execute({ email: 'test@mail.com', password: '123456' });
    });
  });

  it('throws error when using wrong password', async () => {
    const saltNumber = 6;
    const password = '123456';

    const data = {
      username: 'Testing Joe',
      email: 'test@mail.com',
      password_hash: await hash(password, saltNumber),
    };

    await repository.create(data);

    await expect(async () => {
      return await sut.execute({
        email: 'test@mail.com',
        password: 'wrong-password',
      });
    }).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
