import { test, expect } from '@playwright/test';

test.describe('Realtime Ordering Flow', () => {
  test('customer order should appear in KDS in realtime', async ({ browser }) => {
    // Context A: Customer
    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();
    await customerPage.goto('http://localhost:3000/login');
    
    // Login as Table
    await customerPage.fill('input[type="email"]', 'table1@example.com');
    await customerPage.click('button:has-text("Sign In")');
    await expect(customerPage).toHaveURL(/.*menu/);

    // Context B: Chef
    const chefContext = await browser.newContext();
    const chefPage = await chefContext.newPage();
    await chefPage.goto('http://localhost:3000/login');
    
    // Login as Kitchen Staff
    await chefPage.fill('input[type="email"]', 'kitchen@example.com');
    await chefPage.click('button:has-text("Sign In")');
    await expect(chefPage).toHaveURL(/.*kds/);

    // Customer adds item to cart and places order
    await customerPage.click('button:has-text("Add to Order")');
    await customerPage.click('button:has-text("Cart")');
    await customerPage.click('button:has-text("Place Order")');
    
    // Check if toast success appears
    await expect(customerPage.locator('text=Order placed successfully')).toBeVisible();

    // Kitchen Staff should see the new ticket without reload
    // The ticket ID is random, so we check for "Table 1" (the mock table)
    await expect(chefPage.locator('text=Table 1')).toBeVisible();
    
    // Kitchen Staff starts cooking
    await chefPage.click('button:has-text("Start Cooking")');
    await expect(chefPage.locator('text=IN_PROGRESS')).toBeVisible();

    await customerContext.close();
    await chefContext.close();
  });
});
