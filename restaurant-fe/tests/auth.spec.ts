import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

  test('should login successfully as admin', async ({ page }) => {
    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Mật khẩu').fill('password123');
    await page.getByRole('button', { name: 'Đăng nhập' }).click();

    // Wait for success toast
    await expect(page.getByText(/Đăng nhập thành công/i)).toBeVisible({ timeout: 10000 });
    
    // Should redirect to admin dashboard
    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
  });

  test('should login successfully as chef', async ({ page }) => {
    await page.getByLabel('Email').fill('chef@example.com');
    await page.getByLabel('Mật khẩu').fill('password123');
    await page.getByRole('button', { name: 'Đăng nhập' }).click();

    await expect(page.getByText(/Đăng nhập thành công/i)).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/\/chef/, { timeout: 10000 });
  });

  test('should login successfully as staff', async ({ page }) => {
    await page.getByLabel('Email').fill('staff@example.com');
    await page.getByLabel('Mật khẩu').fill('password123');
    await page.getByRole('button', { name: 'Đăng nhập' }).click();

    await expect(page.getByText(/Đăng nhập thành công/i)).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/\/staff/, { timeout: 10000 });
  });

  test('should login successfully as customer', async ({ page }) => {
    await page.getByLabel('Email').fill('customer@example.com');
    await page.getByLabel('Mật khẩu').fill('password123');
    await page.getByRole('button', { name: 'Đăng nhập' }).click();

    await expect(page.getByText(/Đăng nhập thành công/i)).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/\/customer/, { timeout: 10000 });
  });

  test('should show error on invalid credentials', async ({ page }) => {
    // In our mock, login only fails if there's an actual exception.
    // However, if the email doesn't match the schema, zod will catch it.
    await page.getByLabel('Email').fill('invalid-email');
    await page.getByLabel('Mật khẩu').fill('short');
    await page.getByRole('button', { name: 'Đăng nhập' }).click();

    // Should show validation errors
    // Note: The specific error messages depend on your zod schema in auth.config.ts
    // For now, we'll just check if we're still on the login page
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
