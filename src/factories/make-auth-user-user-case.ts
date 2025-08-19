import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository';
import { AuthUserUseCase } from '@/use-cases/auth-user';

export function makeAuthUserUseCase() {
  const repository = new PrismaUsersRepository();
  const useCase = new AuthUserUseCase(repository);

  return useCase;
}
