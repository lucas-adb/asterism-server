import { FavoriteType } from '@prisma/client';
import type { FastifyReply, FastifyRequest } from 'fastify';
import z from 'zod';
import { makeCreateFavoriteWithTagsUseCase } from '@/factories/make-create-favorite-with-tags-use-case';
import { HTTP_STATUS } from '@/utils/status-code';

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const minLength = 2;

  const bodySchema = z.object({
    title: z.string().min(minLength),
    description: z.string().min(minLength),
    url: z.url().min(minLength),
    type: z.enum(FavoriteType),
    tags: z.array(z.string()),
  });

  const { title, description, url, type, tags } = bodySchema.parse(
    request.body
  );

  const useCase = makeCreateFavoriteWithTagsUseCase();

  const favorite = await useCase.execute({
    title,
    description,
    url,
    type,
    tags,
    user_id: request.user.sub,
  });

  reply.status(HTTP_STATUS.CREATED).send(favorite);
}
