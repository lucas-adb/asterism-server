import request from 'supertest';
import { app } from '@/app';

export async function createUserAndGetToken(overrides = {}) {
  const userData = {
    username: 'testuser',
    email: 'test@example.com',
    password: '123456',
    ...overrides,
  };

  await request(app.server).post('/user').send(userData);

  const authResponse = await request(app.server).post('/user/auth').send({
    email: userData.email,
    password: userData.password,
  });

  return {
    token: authResponse.body.token,
    user: userData,
  };
}

export async function getAuthToken(overrides = {}) {
  const { token } = await createUserAndGetToken(overrides);
  return token;
}
