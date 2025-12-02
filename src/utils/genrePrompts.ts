import type { GenerationParams } from "../types/generation";

export type GenreOption = {
  value: string;
  label: string;
  description: string;
};

export const genreOptions: GenreOption[] = [
  {
    value: "R&B",
    label: "R&B",
    description:
      "GENRE: Experimental post-soviet alt-rap, trap drums, lo-fi R&B textures, jazzy chords, indie-rock guitar.",
  },
  {
    value: "POP",
    label: "POP",
    description:
      "GENRE: rich alto vocal with bold chest tone, smooth legato phrasing, soft vibrato endings, close-mic studio feel with stereo reverb, confident pop delivery, modern retro flair.",
  },
  {
    value: "Dance pop",
    label: "Dance pop",
    description:
      "GENRE: Emotional modern pop with Eastern-inspired atmosphere — confident female vocal, warm synths, lush strings, deep 808 bass, and shimmering pads. Tempo around 96 BPM, minor mood, blending sensuality and empowerment. Rich reverb vocals, layered harmonies, cinematic chorus lift. Exclude male vocals and EDM drops.",
  },
  {
    value: "Кавказкий POP-RAP",
    label: "Кавказкий POP-RAP",
    description:
      "GENRE: Dark cinematic hip-hop track, medium to fast tempo, minor key, dramatic strings and tense synth pads, hard-hitting boom-bap / grime-influenced drums with sharp snare and punchy kick, heavy but controlled bass, multilayered arrangement with atmospheric city and crowd textures, intense and energetic overall mood, soundtrack feeling of a dystopian metropolis and social tension, vocal space in the mix kept clear and upfront.",
  },
];

export const resolveGenreDescription = (
  value: string | null | undefined
): string | null => genreOptions.find((option) => option.value === value)?.description ?? null;

export const withGenreDescription = (
  params: GenerationParams | null | undefined
): GenerationParams | null => {
  if (!params) return null;

  const description = resolveGenreDescription(params.style ?? null);
  if (!description) {
    return { ...params };
  }

  return {
    ...params,
    style: description,
  };
};






