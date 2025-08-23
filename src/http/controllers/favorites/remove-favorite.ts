import type { FastifyReply, FastifyRequest } from 'fastify';
import z from 'zod';
import { makeDeleteFavoriteUseCase } from '@/factories/make-delete-favorite-use-case';
import { HTTP_STATUS } from '@/utils/status-code';

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    favorite_id: z.uuid(),
  });

  const { favorite_id } = paramsSchema.parse(request.params);

  const useCase = makeDeleteFavoriteUseCase();

  await useCase.execute({
    favorite_id,
    user_id: request.user.sub,
  });

  reply.status(HTTP_STATUS.NO_CONTENT).send();
}
