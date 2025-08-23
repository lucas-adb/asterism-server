import { PrismaFavoritesRepository } from '@/repositories/prisma/prisma-favorites-repository';
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository';
import { DeleteFavoriteUseCase } from '@/use-cases/delete-favorite-use-case';

export function makeDeleteFavoriteUseCase() {
  const favoritesRepository = new PrismaFavoritesRepository();
  const usersRepository = new PrismaUsersRepository();
  const useCase = new DeleteFavoriteUseCase(
    favoritesRepository,
    usersRepository
  );

  return useCase;
}
