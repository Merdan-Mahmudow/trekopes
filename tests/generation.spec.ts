import { test, expect } from '@playwright/test';
import { bootstrapApp } from './testUtils';

test('анкета вопросов сохраняет ответы и позволяет вернуться назад', async ({ page }) => {
  await bootstrapApp(page);

  await page.goto('/question?category=friend');

  await expect(page.getByText('Вопрос 1')).toBeVisible();

  const textarea = page.getByRole('textbox');
  await textarea.fill('Ответ про друга');

  await page.getByRole('button', { name: /Далее/ }).click();
  await expect(page.getByText('Вопрос 2')).toBeVisible();

  const stored = await page.evaluate(() => localStorage.getItem('qa_answers'));
  const parsed = stored ? JSON.parse(stored) : {};
  expect(parsed['0']).toBe('Ответ про друга');

  await page.getByRole('button', { name: 'Назад' }).click();
  await expect(page.getByText('Вопрос 1')).toBeVisible();
  await expect(page.getByRole('textbox')).toHaveValue('Ответ про друга');
});

test('нулевой баланс переводит экран генерации в оплату PRO', async ({ page }) => {
  await bootstrapApp(page, { user: { limit: 0, bonus_limit: 0, used_limit: 0 } });

  await page.goto('/generate');
  await page.getByText('Песня по сценарию').click();

  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: /Другое/ }).click();
  await dialog.getByRole('button', { name: 'Начать' }).click();

  const resultsTitle = page.getByText('Итог ответов');
  for (let i = 0; i < 15; i += 1) {

    
    // Проверяем, появился ли PRO-диалог (после 3-го вопроса при нулевом балансе)
    const proDialog = page.getByRole('dialog').filter({ hasText: 'Гав! Напоминаю' });
    if (await proDialog.isVisible()) {
      await proDialog.getByRole('button', { name: 'Пропустить' }).click();
      await proDialog.waitFor({ state: 'hidden' });
    }
    
    const nextButton = await page.getByRole('button', { name: 'Пропустить' })
    if (await nextButton.isVisible()) {
      await page.waitForTimeout(1100); // Небольшая задержка для анимации
      await nextButton.click();
    } else {
      break;
    }

  }

  await expect(resultsTitle).toBeVisible();

  await page.getByRole('button', { name: 'Утвердить' }).click();
  await expect(page.getByText('Параметры трека')).toBeVisible();

  await page.getByRole('button', { name: 'Сгенерировать' }).click();

  await expect(page.getByText(/Осталось оплатить PRO-тариф/)).toBeVisible();
  await page.getByRole('button', { name: /Назад/ }).click();

  await expect(page.getByText('Параметры трека')).toBeVisible();
});


