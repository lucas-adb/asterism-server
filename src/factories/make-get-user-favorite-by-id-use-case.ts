import { PrismaFavoritesRepository } from '@/repositories/prisma/prisma-favorites-repository';
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository';
import { GetUserFavoriteByIdUseCase } from '@/use-cases/get-user-favorite-by-id-use-case';

export function makeGetUseFavoriteByIdUseCase() {
  const favoritesRepository = new PrismaFavoritesRepository();
  const usersRepository = new PrismaUsersRepository();
  const useCase = new GetUserFavoriteByIdUseCase(
    favoritesRepository,
    usersRepository
  );

  return useCase;
}
