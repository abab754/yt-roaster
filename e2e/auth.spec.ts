import { test, expect } from '@playwright/test';

test('unauthenticated visit to /dashboard redirects to home', async ({
  page,
}) => {
  await page.goto('/dashboard');
  await page.waitForURL('/');
  await expect(page).toHaveURL('/');
  await expect(
    page.getByRole('button', { name: /sign in with google/i }),
  ).toBeVisible();
});

test('home page shows sign in button when logged out', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /youtube roast/i }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /sign in with google/i }),
  ).toBeVisible();
});

test('sign in button triggers Google OAuth flow', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /sign in with google/i }).click();
  // Should redirect to Google's OAuth or Auth.js signin page
  await page.waitForURL((url) => {
    const href = url.href;
    return (
      href.includes('accounts.google.com') || href.includes('/api/auth/signin')
    );
  });
});
