import type { FastifyReply, FastifyRequest } from 'fastify';
import z from 'zod';
import { makeCreateUserUseCase } from '@/factories/make-create-user-use-case';
import { UserAlreadyExistsError } from '@/use-cases/errors/user-already-exists-error';

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
      const statusCodeConflict = 409;

      return reply.status(statusCodeConflict).send({
        message: error.message,
      });
    }

    throw error;
  }

  const statusCodeCreated = 201;
  reply.status(statusCodeCreated).send();
}
