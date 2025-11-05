import { Store } from "@tanstack/react-store";

const store = new Store({
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
    active: "" as "left" | "center" | "right"
  },
  user: {
    avatar: "" as string,
    name: "" as string,
    balance: 0 as number,
    isPro: false as boolean,
  },
  subscription: {
    plans: [
      { id: "track", name: "TRACK", price: 250, period: "мес", perks: ["1 генерация в боте", "Выбор стиля/настроения", "Текст от пса"] },
      { id: "pro", name: "PRO", price: 999, period: "мес", perks: ["10 PRO-треков", "Подробные сценарии", "По артисту/жанру/фото/ссылке"] },
      { id: "ultra", name: "ULTRA", price: 5000, period: "мес", perks: ["1 PREMIUM-трек", "Гарантия результата", "20 PRO-генераций", "Обложка + оживление"] },
    ] as Array<{ id: "track" | "pro" | "ultra"; name: string; price: number; period: string; perks: string[] }>,
    activeId: "track" as "track" | "pro" | "ultra",
    selectedId: undefined as ("track" | "pro" | "ultra") | undefined,
    isSaving: false as boolean,
    error: undefined as string | undefined,
  }
});

export const setDockActive = (page: "left" | "center" | "right") => {
  store.setState((state) => ({
    ...state,
    dock: {
      active: page
    }
  }))
}

export default store;

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
  if (id === "pro") {
    // Поддержка существующего флага PRO
    store.setState((state) => ({ ...state, user: { ...state.user, isPro: true } }));
  }
};

export const setSubscriptionSaving = (isSaving: boolean) => {
  store.setState((state) => ({
    ...state,
    subscription: { ...state.subscription, isSaving }
  }));
};

export const setSubscriptionError = (error?: string) => {
  store.setState((state) => ({
    ...state,
    subscription: { ...state.subscription, error }
  }));
};