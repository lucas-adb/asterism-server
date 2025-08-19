import type { FastifyReply, FastifyRequest } from 'fastify';
import z from 'zod';
import { makeCreateUserUseCase } from '@/factories/make-create-user-use-case';
import { UserAlreadyExistsError } from '@/use-cases/errors/user-already-exists-error';
import { HTTP_STATUS } from '@/utils/statusCode';

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const passwordMinLength = 6;

  const bodySchema = z.object({
    username: z.string(),
    email: z.email(),
    password: z.string().min(passwordMinLength),
  });

  const { username, email, password } = bodySchema.parse(request.body);

  try {
    const useCase = makeCreateUserUseCase();

    await useCase.execute({
      username,
      email,
      password,
    });
  } catch (error) {
    if (error instanceof UserAlreadyExistsError) {
      return reply.status(HTTP_STATUS.CONFLICT).send({
        message: error.message,
      });
    }

    throw error;
  }

  reply.status(HTTP_STATUS.CREATED).send();
}
