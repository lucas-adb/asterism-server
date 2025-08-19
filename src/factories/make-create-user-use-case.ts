import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository';
import { CreateUserUseCase } from '@/use-cases/create-user';

export function makeCreateUserUseCase() {
  const repository = new PrismaUsersRepository();
  const useCase = new CreateUserUseCase(repository);

  return useCase;
}
