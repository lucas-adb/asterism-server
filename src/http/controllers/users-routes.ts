import type { FastifyInstance } from 'fastify';
import { create } from './create-user.js';

export function usersRoutes(app: FastifyInstance) {
  app.post('/user', create);
  // app.post('/user/auth', auth);
}
