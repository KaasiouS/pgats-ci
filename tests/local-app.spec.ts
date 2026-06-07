import { test, expect } from '@playwright/test';

/**
 * Testes contra o app interno (localhost:3000).
 * Só funcionam quando o runner tem acesso ao servidor local.
 * Em runners cloud estes testes FALHAM — é exatamente esse o ponto
 * do Exercício 3: o self-hosted runner roda na mesma máquina que o app.
 */

test.describe('Interface Web — Sistema Interno', () => {
  test('deve exibir o título principal', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#title')).toHaveText('Sistema Interno');
  });

  test('deve mostrar badge de status Online', async ({ page }) => {
    await page.goto('/');
    const badge = page.locator('#status');
    await expect(badge).toHaveText('Online');
    await expect(badge).toHaveClass(/aprovado/);
  });

  test('deve carregar 3 relatórios na tabela via API', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#tbody tr')).toHaveCount(3, { timeout: 5000 });
  });

  test('primeira linha da tabela deve conter Relatório Mensal', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#tbody tr').first()).toContainText('Relatório Mensal');
  });

  test('relatórios aprovados devem ter badge verde', async ({ page }) => {
    await page.goto('/');
    await page.locator('#tbody tr').first().waitFor();
    const badges = page.locator('#tbody .badge.aprovado');
    await expect(badges).toHaveCount(2);
  });
});

test.describe('API — /api/status', () => {
  test('deve retornar status ok', async ({ request }) => {
    const response = await request.get('/api/status');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.versao).toMatch(/^\d+\.\d+\.\d+$/);
    expect(typeof data.uptime).toBe('number');
  });
});

test.describe('API — /api/relatorios', () => {
  test('deve listar todos os relatórios', async ({ request }) => {
    const response = await request.get('/api/relatorios');
    expect(response.status()).toBe(200);
    const items = await response.json();
    expect(Array.isArray(items)).toBe(true);
    expect(items).toHaveLength(3);
    expect(items[0]).toMatchObject({
      id: expect.any(Number),
      nome: expect.any(String),
      status: expect.stringMatching(/^(aprovado|pendente)$/),
    });
  });

  test('deve retornar relatório pelo ID', async ({ request }) => {
    const response = await request.get('/api/relatorios/1');
    expect(response.status()).toBe(200);
    const item = await response.json();
    expect(item.id).toBe(1);
    expect(item.nome).toBe('Relatório Mensal');
    expect(item.status).toBe('aprovado');
  });

  test('deve retornar 404 para ID inexistente', async ({ request }) => {
    const response = await request.get('/api/relatorios/999');
    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body).toHaveProperty('erro');
  });
});
