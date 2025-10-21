import { Store } from "@tanstack/react-store";

const store = new Store({
  player: {
    src: undefined as string | undefined,
    isVisible: false,
    isPlaying: false,
    currentTrackId: null as string | null,
  },
});

export default store;