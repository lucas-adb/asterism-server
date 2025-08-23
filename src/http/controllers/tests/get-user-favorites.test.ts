import request from 'supertest';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { app } from '@/app';
import { HTTP_STATUS } from '@/utils/status-code';
import { getAuthToken } from './helpers/auth-helper';

type FavoriteResponse = {
  id: string;
  title: string;
  description: string;
  url: string;
  type: string;
  tags: Array<{ name: string }>;
  created_at: string;
  updated_at: string;
};

describe('Get User Favorites e2e', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('should list user favorites with default pagination', async () => {
    const token = await getAuthToken();

    // First, create some favorites
    const favoriteData1 = {
      title: 'React Tutorial',
      description: 'Learn React basics',
      url: 'https://react.example.com',
      type: 'TUTORIALS',
      tags: ['react', 'javascript'],
    };

    const favoriteData2 = {
      title: 'Vue Guide',
      description: 'Vue.js documentation',
      url: 'https://vue.example.com',
      type: 'ARTICLES',
      tags: ['vue', 'javascript'],
    };

    // Create favorites
    await request(app.server)
      .post('/favorite')
      .set('Authorization', `Bearer ${token}`)
      .send(favoriteData1);

    await request(app.server)
      .post('/favorite')
      .set('Authorization', `Bearer ${token}`)
      .send(favoriteData2);

    // Test: Get user favorites
    const response = await request(app.server)
      .get('/favorites')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(HTTP_STATUS.OK);
    expect(response.body).toEqual({
      favorites: expect.any(Array),
      pagination: expect.objectContaining({
        page: 1,
        limit: 10,
        total: expect.any(Number),
        totalPages: expect.any(Number),
        hasNextPage: expect.any(Boolean),
        hasPrevPage: false,
      }),
    });

    expect(response.body.favorites.length).toBeGreaterThanOrEqual(2);
    expect(response.body.favorites[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        title: expect.any(String),
        description: expect.any(String),
        url: expect.any(String),
        type: expect.any(String),
        tags: expect.any(Array),
        created_at: expect.any(String),
        updated_at: expect.any(String),
      })
    );
  });

  test('should filter favorites by type', async () => {
    const token = await getAuthToken();

    const response = await request(app.server)
      .get('/favorites?type=TUTORIALS')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(HTTP_STATUS.OK);
    expect(
      response.body.favorites.every(
        (fav: FavoriteResponse) => fav.type === 'TUTORIALS'
      )
    ).toBe(true);
  });

  test('should filter favorites by tags', async () => {
    const token = await getAuthToken();

    const response = await request(app.server)
      .get('/favorites?tags=react,javascript')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(HTTP_STATUS.OK);
    // Should only return favorites that have BOTH react AND javascript tags
    if (response.body.favorites.length > 0) {
      expect(response.body.favorites[0].tags).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'react' }),
          expect.objectContaining({ name: 'javascript' }),
        ])
      );
    }
  });

  test('should filter favorites by search query', async () => {
    const token = await getAuthToken();

    const response = await request(app.server)
      .get('/favorites?search=react')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(HTTP_STATUS.OK);
    // Should return favorites that contain "react" in title or description
    if (response.body.favorites.length > 0) {
      const containsReact = response.body.favorites.some(
        (fav: FavoriteResponse) =>
          fav.title.toLowerCase().includes('react') ||
          fav.description.toLowerCase().includes('react')
      );
      expect(containsReact).toBe(true);
    }
  });

  test('should apply pagination correctly', async () => {
    const token = await getAuthToken();

    const response = await request(app.server)
      .get('/favorites?page=1&limit=1')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(HTTP_STATUS.OK);
    expect(response.body.favorites.length).toBeLessThanOrEqual(1);
    expect(response.body.pagination.page).toBe(1);
    expect(response.body.pagination.limit).toBe(1);
  });

  test('should sort favorites by created_at desc by default', async () => {
    const token = await getAuthToken();

    const response = await request(app.server)
      .get('/favorites')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(HTTP_STATUS.OK);

    if (response.body.favorites.length > 1) {
      const first = new Date(response.body.favorites[0].created_at);
      const second = new Date(response.body.favorites[1].created_at);
      expect(first.getTime()).toBeGreaterThanOrEqual(second.getTime());
    }
  });

  test('should sort favorites by created_at asc when specified', async () => {
    const token = await getAuthToken();

    const response = await request(app.server)
      .get('/favorites?sortOrder=asc')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(HTTP_STATUS.OK);

    if (response.body.favorites.length > 1) {
      const first = new Date(response.body.favorites[0].created_at);
      const second = new Date(response.body.favorites[1].created_at);
      expect(first.getTime()).toBeLessThanOrEqual(second.getTime());
    }
  });

  test('should fail without authentication', async () => {
    const response = await request(app.server).get('/favorites');

    expect(response.statusCode).toBe(HTTP_STATUS.UNAUTHORIZED);
  });

  test('should validate query parameters', async () => {
    const token = await getAuthToken();

    // Test invalid page
    const response1 = await request(app.server)
      .get('/favorites?page=0')
      .set('Authorization', `Bearer ${token}`);
    expect(response1.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);

    // Test invalid limit
    const response2 = await request(app.server)
      .get('/favorites?limit=101') // Exceeds MAX_LIMIT
      .set('Authorization', `Bearer ${token}`);
    expect(response2.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);

    // Test invalid type
    const response3 = await request(app.server)
      .get('/favorites?type=INVALID_TYPE')
      .set('Authorization', `Bearer ${token}`);
    expect(response3.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);

    // Test invalid sortOrder
    const response4 = await request(app.server)
      .get('/favorites?sortOrder=invalid')
      .set('Authorization', `Bearer ${token}`);
    expect(response4.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
  });
});
