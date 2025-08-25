import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import fastify from 'fastify';
import z, { ZodError } from 'zod';
import { env } from './env';
import { favoriteRoutes } from './http/controllers/favorites/favorite-routes';
import { usersRoutes } from './http/controllers/users/users-routes';
import { ResourceNotFoundError } from './use-cases/errors/resource-not-found-error';
import { UserUnauthorized } from './use-cases/errors/user-unauthorized-error';
import { HTTP_STATUS } from './utils/status-code';

export const app = fastify();

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: 'refreshToken',
    signed: false,
  },
  sign: {
    expiresIn: '10m',
  },
});

app.register(fastifyCors, {
  origin: env.FRONTEND_URL, // front address
  credentials: true, // if you use cookies
});

app.register(fastifyCookie);

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof ZodError) {
    const pretty = z.prettifyError(error);

    return reply.status(HTTP_STATUS.BAD_REQUEST).send({
      message: 'Validation error',
      issues: pretty,
    });
  }

  if (error instanceof ResourceNotFoundError) {
    return reply
      .status(HTTP_STATUS.NOT_FOUND)
      .send({ message: 'Resource not found' });
  }

  if (error instanceof UserUnauthorized) {
    return reply
      .status(HTTP_STATUS.FORBIDDEN)
      .send({ message: 'Access denied' });
  }

  if (env.NODE_ENV !== 'production') {
    // biome-ignore lint/suspicious/noConsole: <log not used in prod>
    console.error(error);
  } else {
    // todo: use an external tool
  }

  return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
    message: 'Internal Server Error',
  });
});

app.register(usersRoutes);
app.register(favoriteRoutes);
