import request from 'supertest';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { app } from '@/app';

describe('Create User e2e', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('creates user', async () => {
    const data = {
      username: 'Testing Joe',
      email: 'test@mail.com',
      password: '123456',
    };

    const response = await request(app.server).post('/user').send(data);

    const statusCodeCreated = 201;
    expect(response.statusCode).toEqual(statusCodeCreated);
  });
});
