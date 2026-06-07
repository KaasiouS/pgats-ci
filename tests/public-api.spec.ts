import { test, expect } from '@playwright/test';

/**
 * Testes contra API pública (JSONPlaceholder).
 * Rodam em QUALQUER runner — cloud ou self-hosted.
 * Não dependem de infraestrutura local.
 */

const BASE = 'https://jsonplaceholder.typicode.com';

test.describe('Posts', () => {
  test('deve retornar 100 posts', async ({ request }) => {
    const response = await request.get(`${BASE}/posts`);
    expect(response.status()).toBe(200);
    const posts = await response.json();
    expect(Array.isArray(posts)).toBe(true);
    expect(posts).toHaveLength(100);
  });

  test('deve buscar post por ID', async ({ request }) => {
    const response = await request.get(`${BASE}/posts/1`);
    expect(response.status()).toBe(200);
    const post = await response.json();
    expect(post).toMatchObject({
      id: 1,
      userId: expect.any(Number),
      title: expect.any(String),
      body: expect.any(String),
    });
  });

  test('deve retornar 404 para post inexistente', async ({ request }) => {
    const response = await request.get(`${BASE}/posts/9999`);
    expect(response.status()).toBe(404);
  });
});

test.describe('Usuários', () => {
  test('deve listar 10 usuários', async ({ request }) => {
    const response = await request.get(`${BASE}/users`);
    expect(response.status()).toBe(200);
    const users = await response.json();
    expect(users).toHaveLength(10);
  });

  test('usuário deve ter campos obrigatórios', async ({ request }) => {
    const response = await request.get(`${BASE}/users/1`);
    expect(response.status()).toBe(200);
    const user = await response.json();
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('address');
    expect(user.email).toMatch(/@/);
  });

  test('deve retornar 404 para usuário inexistente', async ({ request }) => {
    const response = await request.get(`${BASE}/users/9999`);
    expect(response.status()).toBe(404);
  });
});

test.describe('Comentários', () => {
  test('deve filtrar comentários por postId', async ({ request }) => {
    const response = await request.get(`${BASE}/comments?postId=1`);
    expect(response.status()).toBe(200);
    const comments = await response.json();
    expect(comments.length).toBeGreaterThan(0);
    comments.forEach((c: { postId: number }) => {
      expect(c.postId).toBe(1);
    });
  });
});
