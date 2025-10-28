import {
  Artist,
  Extras,
  FlowStep,
  ParamStyle,
  PhotoData,
  StyleMode,
} from "@/types/photo-song";
import store from ".";

export const photoSongStore = {
  flowStep: "photo" as FlowStep,
  photoData: null as PhotoData,
  extras: { text: "" } as Extras,
  styleMode: "artist" as StyleMode,
  selectedArtist: null as Artist | null,
  paramStyle: {} as ParamStyle,
  balance: 18,
};

export const setFlowStep = (step: FlowStep) => {
  store.setState((state) => ({
    ...state,
    photoSong: {
      ...state.photoSong,
      flowStep: step,
    },
  }));
};

export const setPhotoData = (photoData: PhotoData) => {
  store.setState((state) => ({
    ...state,
    photoSong: {
      ...state.photoSong,
      photoData,
    },
  }));
};

export const setExtras = (extras: Extras) => {
  store.setState((state) => ({
    ...state,
    photoSong: {
      ...state.photoSong,
      extras,
    },
  }));
};

export const setStyleMode = (styleMode: StyleMode) => {
  store.setState((state) => ({
    ...state,
    photoSong: {
      ...state.photoSong,
      styleMode,
    },
  }));
};

export const setSelectedArtist = (artist: Artist | null) => {
  store.setState((state) => ({
    ...state,
    photoSong: {
      ...state.photoSong,
      selectedArtist: artist,
    },
  }));
};

export const setParamStyle = (paramStyle: ParamStyle) => {
  store.setState((state) => ({
    ...state,
    photoSong: {
      ...state.photoSong,
      paramStyle,
    },
  }));
};

export const decreaseBalance = () => {
  store.setState((state) => ({
    ...state,
    photoSong: {
      ...state.photoSong,
      balance: state.photoSong.balance - 1,
    },
  }));
};
