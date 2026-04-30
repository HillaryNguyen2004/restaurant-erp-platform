import { test, expect } from '@playwright/test';

test.describe('Realtime Ordering Flow', () => {
  test('customer order should appear in KDS in realtime', async ({ browser }) => {
    // Context A: Customer
    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();
    await customerPage.goto('http://localhost:3000/login');
    
    // Login as Customer
    await customerPage.fill('input[type="email"]', 'customer@example.com');
    await customerPage.selectOption('select', 'CUSTOMER');
    await customerPage.click('button:has-text("Login")');
    await expect(customerPage).toHaveURL(/.*menu/);

    // Context B: Chef
    const chefContext = await browser.newContext();
    const chefPage = await chefContext.newPage();
    await chefPage.goto('http://localhost:3000/login');
    
    // Login as Chef
    await chefPage.fill('input[type="email"]', 'chef@example.com');
    await chefPage.selectOption('select', 'CHEF');
    await chefPage.click('button:has-text("Login")');
    await expect(chefPage).toHaveURL(/.*kds/);

    // Customer adds item to cart and places order
    await customerPage.click('button:has-text("Add to Order")');
    await customerPage.click('button:has-text("Cart")');
    await customerPage.click('button:has-text("Place Order")');
    
    // Check if toast success appears
    await expect(customerPage.locator('text=Order placed successfully')).toBeVisible();

    // Chef should see the new ticket without reload
    // The ticket ID is random, so we check for "Table A1" (the mock table)
    await expect(chefPage.locator('text=Table A1')).toBeVisible();
    
    // Chef starts cooking
    await chefPage.click('button:has-text("Start Cooking")');
    await expect(chefPage.locator('text=IN_PROGRESS')).toBeVisible();

    await customerContext.close();
    await chefContext.close();
  });
});
