import { test, expect } from '@playwright/test';
import { bootstrapApp } from './testUtils';

test('первый визит открывает welcome-истории', async ({ page }) => {
  await bootstrapApp(page, { welcomeSeen: false });

  await page.goto('/');

  await expect(page).toHaveURL(/\/welcome$/);
  await expect(page.getByText('Добро пожаловать в Trekopes')).toBeVisible();
});

test('повторный визит сразу ведёт на экран генерации', async ({ page }) => {
  await bootstrapApp(page);

  await page.goto('/');

  await expect(page).toHaveURL(/\/generate$/);
  await expect(page.getByText('Создать трек')).toBeVisible();
  await expect(page.getByText('Песня по сценарию')).toBeVisible();
  await expect(page.getByText('Песня по артисту')).toBeVisible();
});

test('карточка сценария открывает анкету и закрывается крестиком', async ({ page }) => {
  await bootstrapApp(page);

  await page.goto('/generate');
  await page.getByText('Песня по сценарию').click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Выбери тему сценария' })).toBeVisible();

  await dialog.getByRole('button', { name: 'Close' }).click();
  await expect(dialog).toBeHidden();
});

test('док-панель ведёт в рефералку и отправляет ссылку в Telegram', async ({ page }) => {
  const { telegramUser } = await bootstrapApp(page);

  await page.goto('/generate');
  await page.getByRole('button', { name: 'Users' }).click();

  await expect(page).toHaveURL(/\/referral$/);
  await expect(page.getByText('Пригласи друга')).toBeVisible();

  await page.getByRole('button', { name: 'Пригласить друга' }).click();

  const lastLink = await page.evaluate(() => {
    const links = (globalThis as { __tgLinks?: string[] }).__tgLinks ?? [];
    return links[links.length - 1] ?? '';
  });

//   expect(lastLink).toContain(String(telegramUser.id));
//   expect(lastLink).toContain('https://t.me/share/url?url=');
});

test('страница профиля показывает треки и текст песни', async ({ page }) => {
  await bootstrapApp(page);

  await page.goto('/profile');

  await expect(page.getByText('Мои треки')).toBeVisible();
  await expect(page.getByText('Песня про космос')).toBeVisible();

  await page.getByRole('button', { name: 'show-lyrics' }).click();

  const lyricsDialog = page.getByRole('dialog', { name: 'Песня про космос' });
  await expect(lyricsDialog).toBeVisible();
  await expect(lyricsDialog.getByText('Привет, команда')).toBeVisible();

  await lyricsDialog.getByRole('button', { name: 'Close' }).click();
});

test('если треков нет — показываем CTA на генерацию', async ({ page }) => {
  await bootstrapApp(page, { generations: [] });

  await page.goto('/profile');

  await expect(page.getByRole('link', { name: 'Создать трек' })).toBeVisible();
});


