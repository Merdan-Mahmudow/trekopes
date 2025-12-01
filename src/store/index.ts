import { Store } from "@tanstack/react-store";
import type {
  GenerationDto,
  PaginationMeta,
  SongGenerationType,
} from "../types/webapp";
import type {
  Artist,
  GenerationDraft,
  GenerationDraftPhoto,
  GenerationDraftScenario,
  GenerationParams,
} from "../types/generation";
import { createInitialGenerationDraft } from "../types/generation";

export type UserState = {
  id: string;
  telegram_chat_id: number;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  limit: number;
  used_limit: number;
  bonus_limit: number;
  referrals_signup_count: number;
  referrals_purchase_count: number;
  pack_id?: number | null;
  isPro?: boolean;
};

type AuthState = {
  token?: string;
};

type TemplatesState = {
  scenarioTemplateId: string | null;
};

type PaymentsState = {
  hasPayments: boolean;
  isPro: boolean;
};

const initialAuthState: AuthState = {
  token: undefined,
};

const initialTemplatesState: TemplatesState = {
  scenarioTemplateId: null,
};

const initialPaymentsState: PaymentsState = {
  hasPayments: false,
  isPro: false,
};

const initialUserState: UserState = {
  id: "",
  telegram_chat_id: 0,
  username: undefined,
  first_name: undefined,
  last_name: undefined,
  limit: 0,
  used_limit: 0,
  bonus_limit: 0,
  referrals_signup_count: 0,
  referrals_purchase_count: 0,
  pack_id: null,
};

const initialStoreState = {
  player: {
    src: undefined as string | undefined,
    isVisible: false,
    isPlaying: false,
    currentTrackId: null as string | null,
    queue: [] as Array<{ id: string; src: string; title?: string; artist?: string; cover?: string; duration?: number }>,
    currentIndex: -1,
    title: undefined as string | undefined,
    artist: undefined as string | undefined,
    cover: undefined as string | undefined,
  },
  dock: {
    active: "" as "left" | "center" | "right",
  },
  user: initialUserState,
  auth: initialAuthState,
  templates: initialTemplatesState,
  payments: initialPaymentsState,
  subscription: {
    plans: [
      { id: "track", name: "TRACK", price: 250, period: "мес", perks: ["1 генерация в боте", "Выбор стиля, настроения и референсов до запуска", "Запрос голосом или текстом", "Трекопёс пишет текст песни"] },
      { id: "pro", name: "PRO", price: 1000, period: "мес", perks: ["10 PRO-треков", "Подробные сценарии", "По артисту/жанру/фото/ссылке"] },
      { id: "ultra", name: "ULTRA", price: 5000, period: "мес", perks: ["25 PRO-треков", "Подробные сценарии", "По артисту/жанру/фото/ссылке"] },
    ] as Array<{ id: "track" | "pro" | "ultra"; name: string; price: number; period: string; perks: string[] }>,
    activeId: "track" as "track" | "pro" | "ultra",
    selectedId: undefined as ("track" | "pro" | "ultra") | undefined,
    isSaving: false as boolean,
  },
  music: {
    generations: [] as GenerationDto[],
    meta: null as PaginationMeta | null,
  },
  generationDraft: createInitialGenerationDraft(),
};

const store = new Store(initialStoreState);

type StoreState = typeof initialStoreState;

export const setDockActive = (page: "left" | "center" | "right") => {
  store.setState((state) => ({
    ...state,
    dock: {
      active: page,
    },
  }));
};

export default store;

export const setAuthToken = (token?: string) => {
  store.setState((state) => ({
    ...state,
    auth: { ...(state.auth as AuthState), token },
  }));
};

export const setUserState = (user: Partial<UserState>) => {
  store.setState((state) => ({
    ...state,
    user: { ...state.user, ...user },
  }));
};

export const setHasPayments = (hasPayments: boolean) => {
  store.setState((state) => ({
    ...state,
    payments: { ...state.payments, hasPayments },
  }));
};

export const setIsProFromPayments = (isPro: boolean) => {
  store.setState((state) => ({
    ...state,
    payments: { ...state.payments, isPro },
  }));
};

export const setScenarioTemplateId = (templateId: string | null) => {
  store.setState((state) => ({
    ...state,
    templates: { ...state.templates, scenarioTemplateId: templateId },
  }));
};

// Subscription helpers
export type TarrifId = "track" | "pro" | "ultra";

export const setSelectedTarrif = (id: TarrifId | undefined) => {
  store.setState((state) => ({
    ...state,
    subscription: { ...state.subscription, selectedId: id }
  }));
};

export const setActiveTarrif = (id: TarrifId) => {
  store.setState((state) => ({
    ...state,
    subscription: { ...state.subscription, activeId: id }
  }));
};

export const setSubscriptionSaving = (isSaving: boolean) => {
  store.setState((state) => ({
    ...state,
    subscription: { ...state.subscription, isSaving }
  }));
};

export const setMusicGenerations = (
  generations: GenerationDto[],
  meta?: PaginationMeta
) => {
  store.setState((state) => ({
    ...state,
    music: {
      ...state.music,
      generations,
      meta: meta ?? state.music.meta,
    },
  }));
};

const cloneArtist = (artist: Artist | null | undefined): Artist | null =>
  artist ? { ...artist } : null;

const cloneParams = (
  params: GenerationParams | null | undefined
): GenerationParams | null =>
  params
    ? {
        tempo: params.tempo,
        mood: params.mood ?? null,
        style: params.style ?? null,
        voice: params.voice ?? null,
      }
    : null;

const clonePhoto = (
  photo: GenerationDraftPhoto | null | undefined
): GenerationDraftPhoto | null =>
  photo
    ? {
        ...photo,
      }
    : null;

const cloneScenario = (
  scenario: GenerationDraftScenario | null | undefined
): GenerationDraftScenario | null => {
  if (!scenario) return null;

  switch (scenario.mode) {
    case "scenario":
      return {
        ...scenario,
        artist: cloneArtist(scenario.artist),
        params: cloneParams(scenario.params),
        answers: scenario.answers.map((answer) => ({ ...answer })),
      };
    case "photo":
      return {
        ...scenario,
        artist: cloneArtist(scenario.artist),
        params: cloneParams(scenario.params),
        photo: clonePhoto(scenario.photo),
      };
    case "link":
      return {
        ...scenario,
        artist: cloneArtist(scenario.artist),
        params: cloneParams(scenario.params),
      };
    case "style":
      return {
        ...scenario,
        artist: cloneArtist(scenario.artist),
        params: cloneParams(scenario.params),
      };
    case "text":
      return {
        ...scenario,
        artist: cloneArtist(scenario.artist),
        params: cloneParams(scenario.params),
      };
    default:
      return scenario;
  }
};

const cloneDraft = (
  draft: GenerationDraft | null | undefined
): GenerationDraft => {
  const base = draft ?? createInitialGenerationDraft();

  return {
    ...base,
    scenario: cloneScenario(base.scenario),
    metadata: base.metadata ? { ...base.metadata } : undefined,
  };
};

const withDraftUpdate = (
  state: StoreState,
  updater: (draft: GenerationDraft) => GenerationDraft
): StoreState => {
  const current = cloneDraft(state.generationDraft);
  const next = cloneDraft(updater(current));

  return {
    ...state,
    generationDraft: next,
  };
};

export const resetGenerationDraft = () => {
  store.setState((state) => ({
    ...state,
    generationDraft: createInitialGenerationDraft(),
  }));
};

export const setGenerationDraft = (draft: GenerationDraft) => {
  store.setState((state) => ({
    ...state,
    generationDraft: cloneDraft(draft),
  }));
};

export const setGenerationType = (type: SongGenerationType | null) => {
  store.setState((state) =>
    withDraftUpdate(state, (draft) => ({
      ...draft,
      type,
    }))
  );
};

export const setGenerationPrompt = (prompt: string | null) => {
  store.setState((state) =>
    withDraftUpdate(state, (draft) => ({
      ...draft,
      prompt,
    }))
  );
};

export const setGenerationTemplate = (options: {
  templateId?: string | null;
  templateArtistId?: string | null;
}) => {
  store.setState((state) =>
    withDraftUpdate(state, (draft) => ({
      ...draft,
      templateId:
        options.templateId !== undefined ? options.templateId : draft.templateId,
      templateArtistId:
        options.templateArtistId !== undefined
          ? options.templateArtistId
          : draft.templateArtistId,
    }))
  );
};

export const setGenerationMetadata = (
  metadata: Record<string, unknown> | undefined
) => {
  store.setState((state) =>
    withDraftUpdate(state, (draft) => ({
      ...draft,
      metadata: metadata ? { ...metadata } : undefined,
    }))
  );
};

export const setGenerationScenario = (
  scenario: GenerationDraftScenario | null
) => {
  store.setState((state) =>
    withDraftUpdate(state, (draft) => ({
      ...draft,
      scenario: cloneScenario(scenario),
    }))
  );
};

export const updateGenerationScenario = (
  updater: (
    scenario: GenerationDraftScenario | null
  ) => GenerationDraftScenario | null
) => {
  store.setState((state) =>
    withDraftUpdate(state, (draft) => ({
      ...draft,
      scenario: cloneScenario(
        updater(cloneScenario(draft.scenario))
      ),
    }))
  );
};