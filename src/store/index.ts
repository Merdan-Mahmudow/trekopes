import { Store } from "@tanstack/react-store";
import { photoSongStore } from "./photo-song";

const persistedState = localStorage.getItem("photoSongState");
const initialState = persistedState ? JSON.parse(persistedState) : photoSongStore;


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
  photoSong: initialState,
});

store.subscribe(() => {
  const { photoSong } = store.state;
  // Не сохраняем фото, если оно слишком большое
  if (photoSong.photoData && photoSong.photoData.dataUrl.length > 2 * 1024 * 1024) {
    localStorage.setItem("photoSongState", JSON.stringify({ ...photoSong, photoData: null }));
  } else {
    localStorage.setItem("photoSongState", JSON.stringify(photoSong));
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