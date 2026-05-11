import { test, expect } from '@playwright/test';

const validClientToken = `header.${Buffer.from(JSON.stringify({ exp: 4102444800 })).toString('base64url')}.signature`;
const validAdminToken = `header.${Buffer.from(JSON.stringify({ exp: 4102444800 })).toString('base64url')}.signature`;

// Helper: simulate a logged-in client session via localStorage
async function loginAsClient(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('jwt_token', 'TOKEN_PLACEHOLDER');
    localStorage.setItem('user_role', 'ROLE_CLIENT');
    localStorage.setItem('user_nom', 'Client');
    localStorage.setItem('user_prenom', 'Test');
    localStorage.setItem('user_email', 'client@test.com');
  });
  await page.evaluate(token => localStorage.setItem('jwt_token', token), validClientToken);
}

async function loginAsConcessionnaire(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('jwt_token', 'TOKEN_PLACEHOLDER');
    localStorage.setItem('user_role', 'ROLE_CONCESSIONNAIRE');
    localStorage.setItem('user_nom', 'Concessionnaire');
    localStorage.setItem('user_prenom', 'Admin');
    localStorage.setItem('user_email', 'admin@bagni.it');
  });
  await page.evaluate(token => localStorage.setItem('jwt_token', token), validAdminToken);
}

test.describe('Client — Reservations page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsClient(page);
  });

  test('shows Réservations heading and Nouvelle réservation button', async ({ page }) => {
    await page.goto('/reservations');
    await expect(page.locator('.section-title')).toContainText('Réservations');
    await expect(page.locator('a[routerLink="/reservations/nouvelle"]')).toBeVisible();
  });

  test('navigation to nouvelle-reservation works', async ({ page }) => {
    await page.goto('/reservations');
    await page.click('a[routerLink="/reservations/nouvelle"]');
    await expect(page).toHaveURL(/\/reservations\/nouvelle/);
    await expect(page.locator('.page-title')).toContainText('Nouvelle réservation');
  });
});

test.describe('Client — Nouvelle réservation stepper', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsClient(page);
  });

  test('navigation to stepper form works', async ({ page }) => {
    await page.goto('/reservations/nouvelle');
    await expect(page.locator('.page-title')).toContainText('Nouvelle réservation');
    // Form loads but requires backend API for parasol data
  });
});

test.describe('Concessionnaire — Planning', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsConcessionnaire(page);
  });

  test('planning page shows queue and toolbar', async ({ page }) => {
    await page.goto('/planning');
    await expect(page.locator('.planning-queue')).toBeVisible();
    await expect(page.locator('.planning-toolbar')).toBeVisible();
  });

  test('view toggle buttons are present', async ({ page }) => {
    await page.goto('/planning');
    await expect(page.locator('.view-btn')).toHaveCount(4);
  });

  test('today button is present in toolbar', async ({ page }) => {
    await page.goto('/planning');
    await expect(page.locator('button:has-text("Aujourd\'hui")')).toBeVisible();
  });
});

test.describe('Concessionnaire — Clients', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsConcessionnaire(page);
  });

  test('clients page shows heading', async ({ page }) => {
    await page.goto('/clients');
    await expect(page.locator('.section-title')).toContainText('Clients');
  });
});

test.describe('Concessionnaire — cannot access client-only routes', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsConcessionnaire(page);
  });

  test('redirected away from /reservations/nouvelle', async ({ page }) => {
    await page.goto('/reservations/nouvelle');
    await expect(page).not.toHaveURL(/\/reservations\/nouvelle/);
  });
});
