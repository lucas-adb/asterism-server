import request from 'supertest';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { app } from '@/app';
import { HTTP_STATUS } from '@/utils/status-code';

describe('Auth Org e2e', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('auth org', async () => {
    const data = {
      username: 'Testing Joe',
      email: 'test@mail.com',
      password: '123456',
    };

    await request(app.server).post('/user').send(data);

    const authResponse = await request(app.server)
      .post('/user/auth')
      .send({ email: data.email, password: data.password });

    expect(authResponse.statusCode).toEqual(HTTP_STATUS.OK);

    expect(authResponse.body).toEqual({
      token: expect.any(String),
    });
  });
});
