import type { FastifyInstance } from 'fastify';
import { auth } from './auth-user';
import { create } from './create-user';
import { refresh } from './refresh-user';

export function usersRoutes(app: FastifyInstance) {
  app.post('/user', create);
  app.post('/user/auth', auth);
  app.post('/user/refresh', refresh);
}
