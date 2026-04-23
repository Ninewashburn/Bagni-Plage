import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear session before each test
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
  });

  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('app-bagni-logo')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('login page shows link to register', async ({ page }) => {
    await page.goto('/login');
    const registerLink = page.locator('a[routerLink="/register"], a[href="/register"]');
    await expect(registerLink).toBeVisible();
  });

  test('register page renders correctly', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('app-bagni-logo')).toBeVisible();
    await expect(page.locator('input[formControlName="prenom"]')).toBeVisible();
    await expect(page.locator('input[formControlName="nom"]')).toBeVisible();
    await expect(page.locator('input[formControlName="email"]')).toBeVisible();
    await expect(page.locator('input[formControlName="motDePasse"]')).toBeVisible();
  });

  test('shows error on wrong credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-msg')).toBeVisible({ timeout: 5000 });
  });

  test('submit button is disabled when form is invalid', async ({ page }) => {
    await page.goto('/login');
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeDisabled();

    await page.fill('input[type="email"]', 'valid@email.com');
    await expect(submitBtn).toBeDisabled();

    await page.fill('input[type="password"]', 'short');
    await expect(submitBtn).toBeDisabled();

    await page.fill('input[type="password"]', 'validpassword');
    await expect(submitBtn).toBeEnabled();
  });

  test('unauthenticated user is redirected from protected route to login', async ({ page }) => {
    await page.goto('/planning');
    await expect(page).toHaveURL(/\/login/);
  });
});
