import { test, expect } from '@playwright/test';
import { bootstrapApp } from './testUtils';

test('при ошибке логина отображается экран техработ', async ({ page }) => {
  await bootstrapApp(page, {
    api: {
      login: {
        status: 503,
        body: { success: false, message: 'Maintenance' },
      },
    },
  });

  await page.goto('/');

  await expect(page.getByText('Ведутся технические работы.')).toBeVisible();
});


