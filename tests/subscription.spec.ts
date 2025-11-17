import { test, expect } from '@playwright/test';
import { bootstrapApp } from './testUtils';

test('ошибка создания платежа показывает предупреждение', async ({ page }) => {
  await bootstrapApp(page);

  await page.goto('/tarrifs');
  await page.getByLabel('Тариф TRACK').click();

  await expect(page).toHaveURL(/\/subscription/);

  await page.getByPlaceholder('name@example.com').fill('user@example.com');

  await page.route('**/webapp/payments', (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        success: true,
        data: { uuid: 'pay-1', payment_url: null },
      }),
    }),
  );

  await page.getByRole('button', { name: 'Оформить' }).click();

  await expect(page.getByText('Не удалось получить ссылку на оплату')).toBeVisible();
});

test('успешный платёж перенаправляет на страницу оплаты', async ({ page }) => {
  // await bootstrapApp(page);

  await page.goto('/tarrifs');
  await page.getByLabel('Подписка 1 Premium + 50 PRO').click();

  await expect(page).toHaveURL(/\/subscription\?tarrif=ultra/);

  await page.getByPlaceholder('name@example.com').fill('pro@example.com');

  const paymentUrl = 'https://payments.example/pay';
  await page.route('**/webapp/payments', (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        success: true,
        data: { uuid: 'pay-2', payment_url: paymentUrl },
      }),
    }),
  );
  await page.route('https://payments.example/*', (route) =>
    route.fulfill({
      status: 200,
      body: '<html><body>OK</body></html>',
      contentType: 'text/html',
    }),
  );

  const navigation = page.waitForURL(paymentUrl);
  await page.getByRole('button', { name: 'Оформить' }).click();
  await navigation;

  await expect(page).toHaveURL(paymentUrl);
});


