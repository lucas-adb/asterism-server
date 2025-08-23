import { PrismaFavoritesRepository } from '@/repositories/prisma/prisma-favorites-repository';
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository';
import { GetUserFavoritesUseCase } from '@/use-cases/get-user-favorites-use-case';

export function makeGetUserFavoritesUseCase() {
  const favoritesRepository = new PrismaFavoritesRepository();
  const usersRepository = new PrismaUsersRepository();
  const useCase = new GetUserFavoritesUseCase(
    favoritesRepository,
    usersRepository
  );

  return useCase;
}
