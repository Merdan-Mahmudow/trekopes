import { Store } from "@tanstack/react-store";

const store = new Store({
  player: {
    src: undefined as string | undefined,
    isVisible: false,
    isPlaying: false,
    currentTrackId: null as string | null,
  },
  dock: {
    active: "" as "left" | "center" | "right"
  },
  user: {
    avatar: "" as string,
    name: "" as string,
    balance: 0 as number
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