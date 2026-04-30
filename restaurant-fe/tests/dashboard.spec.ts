import { test, expect } from '@playwright/test';

test.describe('Dashboard Navigation', () => {
  test('should navigate through admin dashboard tabs', async ({ page }) => {
    // Login as admin first
    await page.goto('/auth/login');
    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Mật khẩu').fill('password123');
    await page.getByRole('button', { name: 'Đăng nhập' }).click();

    await expect(page).toHaveURL(/\/admin/);

    // Verify presence of common dashboard elements
    // These selectors depend on your layout and components
    // For example, checking for a sidebar or header
    // await expect(page.locator('aside')).toBeVisible();
  });

  test('should navigate to menu page as customer', async ({ page }) => {
    // Login as customer
    await page.goto('/auth/login');
    await page.getByLabel('Email').fill('customer@example.com');
    await page.getByLabel('Mật khẩu').fill('password123');
    await page.getByRole('button', { name: 'Đăng nhập' }).click();

    await expect(page).toHaveURL(/\/customer/);

    // Add more navigation tests here as features are implemented
  });
});
