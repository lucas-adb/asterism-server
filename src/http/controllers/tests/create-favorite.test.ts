import request from 'supertest';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { app } from '@/app';
import { makeFavorite } from '@/use-cases/tests/factories/make-favorite';
import { HTTP_STATUS } from '@/utils/status-code';
import { getAuthToken } from './helpers/auth-helper';

describe('Create Favorite e2e', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('should create favorite with tags', async () => {
    const token = await getAuthToken();

    const favoriteData = {
      title: 'React Documentation',
      description: 'Official React documentation',
      url: 'https://react.dev',
      type: 'SITES',
      tags: ['react', 'javascript', 'frontend'],
    };

    const response = await request(app.server)
      .post('/favorite')
      .set('Authorization', `Bearer ${token}`)
      .send(favoriteData);

    expect(response.statusCode).toBe(HTTP_STATUS.CREATED);

    expect(response.body).toEqual({
      favorite: expect.objectContaining({
        id: expect.any(String),
        title: 'React Documentation',
        // ... outros campos
      }),
      tags: expect.arrayContaining([
        expect.objectContaining({ name: 'react' }),
        expect.objectContaining({ name: 'javascript' }),
        expect.objectContaining({ name: 'frontend' }),
      ]),
    });
  });

  test('should fail without authentication', async () => {
    const favoriteData = makeFavorite();
    const response = await request(app.server)
      .post('/favorite')
      .send(favoriteData);

    expect(response.statusCode).toBe(HTTP_STATUS.UNAUTHORIZED);
  });
});
