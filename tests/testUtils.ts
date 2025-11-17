import type { Page, Route } from '@playwright/test';
import type { ChatDto, GenerationDto } from '../src/types/webapp';

type TelegramUserStub = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
};

export type BootstrapOptions = {
  welcomeSeen?: boolean;
  user?: Partial<ChatDto>;
  telegramUser?: Partial<TelegramUserStub>;
  generations?: GenerationDto[];
  api?: {
    login?: ApiRouteConfig;
    me?: ApiRouteConfig;
    generations?: ApiRouteConfig;
  };
};

type BootstrapResult = {
  user: ChatDto;
  telegramUser: TelegramUserStub;
  generations: GenerationDto[];
};

type ApiRouteConfig = {
  status?: number;
  body?: unknown;
};

const now = new Date().toISOString();

const defaultUser: ChatDto = {
  id: 'user-1',
  telegram_chat_id: 555001,
  username: 'testuser',
  first_name: 'Test',
  last_name: 'User',
  limit: 3,
  used_limit: 1,
  bonus_limit: 1,
  referrals_signup_count: 5,
  referrals_purchase_count: 2,
  isPro: false,
};

const defaultGenerations: GenerationDto[] = [
  {
    id: 'gen-1',
    generation_type: 'scenario',
    status: 'completed',
    prompt: 'Расскажи о команде',
    template_id: null,
    song_id: 'song-1',
    song: {
      id: 'song-1',
      status: 'completed',
      prompt: 'Расскажи о команде',
      title: 'Песня про космос',
      style: 'synthwave',
      lyrics: '[Intro]\nПривет, команда\n[Verse]\nМы летим навстречу звёздам',
      author: 'Трекопёс',
      rating: 5,
      duration: 125,
      created_at: now,
      updated_at: now,
      download_url: 'https://example.com/song-1.mp3',
      files: [
        {
          url: 'https://example.com/song-1.mp3',
          active: true,
        },
      ],
    },
    generated_lyrics: 'Привет, команда',
    generated_title: 'Песня про космос',
    generated_style: 'synthwave',
    suno_task_id: null,
    error_type: null,
    error_message: null,
    metadata: null,
    gpt_started_at: now,
    gpt_completed_at: now,
    suno_started_at: now,
    suno_completed_at: now,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'gen-2',
    generation_type: 'style',
    status: 'processing',
    prompt: 'Сделай что-то новое',
    template_id: null,
    song_id: null,
    song: null,
    generated_lyrics: null,
    generated_title: 'Черновик',
    generated_style: null,
    suno_task_id: null,
    error_type: null,
    error_message: null,
    metadata: null,
    gpt_started_at: now,
    gpt_completed_at: null,
    suno_started_at: null,
    suno_completed_at: null,
    created_at: now,
    updated_at: now,
  },
];

const fulfillJson = (route: Route, body: unknown, status = 200) =>
  route.fulfill({
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });

export async function bootstrapApp(page: Page, options: BootstrapOptions = {}): Promise<BootstrapResult> {
  const user: ChatDto = { ...defaultUser, ...options.user };
  const telegramUser: TelegramUserStub = {
    id: options.telegramUser?.id ?? user.telegram_chat_id,
    first_name: options.telegramUser?.first_name ?? user.first_name ?? 'Test',
    last_name: options.telegramUser?.last_name ?? user.last_name ?? 'User',
    username: options.telegramUser?.username ?? user.username ?? 'testuser',
  };
  const generations = options.generations ?? defaultGenerations;

  await page.addInitScript(
    ({ tgUser, welcomeSeen }) => {
      const noop = () => {};
      const w = globalThis as {
        __tgLinks?: string[];
        Telegram?: any;
        localStorage: {
          setItem: (key: string, value: string) => void;
          removeItem: (key: string) => void;
        };
      };
      w.__tgLinks = [];
      w.Telegram = {
        WebApp: {
          ready: noop,
          setHeaderColor: noop,
          enableClosingConfirmation: noop,
          expand: noop,
          disableVerticalSwipes: noop,
          openTelegramLink: (url: string) => {
            w.__tgLinks = w.__tgLinks || [];
            w.__tgLinks.push(url);
          },
          initDataUnsafe: { user: tgUser },
          initData: 'mock-init-data',
          BackButton: {
            hide: noop,
            show: noop,
          },
        },
      };

      if (welcomeSeen) {
        w.localStorage.setItem('isWelcomeSeen', 'true');
      } else {
        w.localStorage.removeItem('isWelcomeSeen');
      }
    },
    { tgUser: telegramUser, welcomeSeen: options.welcomeSeen !== false },
  );

  const loginConfig = options.api?.login;
  await page.route('**/webapp/auth/login', (route) =>
    fulfillJson(
      route,
      loginConfig?.body ?? {
        success: true,
        data: { token: 'test-token' },
      },
      loginConfig?.status ?? 200,
    ),
  );

  const meConfig = options.api?.me;
  await page.route('**/webapp/me', (route) =>
    fulfillJson(
      route,
      meConfig?.body ?? {
        success: true,
        data: user,
      },
      meConfig?.status ?? 200,
    ),
  );

  const generationsConfig = options.api?.generations;
  await page.route('**/webapp/generations**', (route) =>
    fulfillJson(
      route,
      generationsConfig?.body ?? {
        success: true,
        data: generations,
        meta: {
          offset: 0,
          limit: generations.length,
          total: generations.length,
        },
      },
      generationsConfig?.status ?? 200,
    ),
  );

  const silentResources = ['https://cdn.logrocket.com/*', 'https://r.logrocket.io/*', 'https://cdn.lr-ingest.io/*'];
  await Promise.all(
    silentResources.map((pattern) =>
      page.route(pattern, (route) =>
        route.fulfill({
          status: 204,
          body: '',
        }),
      ),
    ),
  );

  return { user, telegramUser, generations };
}


