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


