import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import fastify from 'fastify';
import z, { ZodError } from 'zod';
import { env } from './env';
import { favoriteRoutes } from './http/controllers/favorites/favorite-routes';
import { usersRoutes } from './http/controllers/users/users-routes';
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

app.register(fastifyCookie);

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof ZodError) {
    const pretty = z.prettifyError(error);

    return reply.status(HTTP_STATUS.BAD_REQUEST).send({
      message: 'Validation error',
      issues: pretty,
    });
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
