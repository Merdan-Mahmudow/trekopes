import type { CreateGenerationRequest, SongGenerationType } from "./webapp";

export type Artist = {
  id: string;
  name: string;
  avatar?: string;
};

export type GenerationParams = {
  tempo: number;
  mood?: string | null;
  style?: string | null;
  voice?: "male" | "female" | "both" | null;
};

export type GenerationDraftAnswer = {
  id: number;
  question: string;
  answer: string;
};

export type GenerationDraftPhotoSource = "upload" | "camera";

export type GenerationDraftPhoto = {
  source: GenerationDraftPhotoSource;
  dataUrl: string;
  mimeType?: string;
  fileName?: string;
};

export type GenerationScenarioBase = {
  artist?: Artist | null;
  params?: GenerationParams | null;
};

export type TextGenerationDraft = GenerationScenarioBase & {
  mode: "text";
  category?: string | null;
  audience?: string | null;
  answers: GenerationDraftAnswer[];
  summary?: string | null;
};

export type PhotoGenerationDraft = GenerationScenarioBase & {
  mode: "photo";
  photo: GenerationDraftPhoto | null;
  caption?: string | null;
};

export type LinkGenerationDraft = GenerationScenarioBase & {
  mode: "link";
  link: string | null;
};

export type StyleGenerationDraft = GenerationScenarioBase & {
  mode: "style";
  prompt: string | null;
};

export type FastGenerationDraft = GenerationScenarioBase & {
  mode: "fast";
  prompt: string | null;
};

export type GenerationDraftScenario =
  | TextGenerationDraft
  | PhotoGenerationDraft
  | LinkGenerationDraft
  | StyleGenerationDraft
  | FastGenerationDraft;

export type GenerationDraft = {
  type: SongGenerationType | null;
  prompt: string | null;
  scenario: GenerationDraftScenario | null;
  templateId?: string | null;
  templateArtistId?: string | null;
  metadata?: Record<string, unknown>;
};

export const initialGenerationDraft: GenerationDraft = {
  type: null,
  prompt: null,
  scenario: null,
  templateId: null,
  templateArtistId: null,
  metadata: undefined,
};

export type CreateGenerationPayloadBuilder = (
  draft: GenerationDraft
) => CreateGenerationRequest;

export const createInitialGenerationDraft = (): GenerationDraft => ({
  ...initialGenerationDraft,
});

export const createTextGenerationDraft = (): TextGenerationDraft => ({
  mode: "text",
  category: null,
  audience: null,
  answers: [],
  summary: null,
  artist: null,
  params: null,
});

export const createPhotoGenerationDraft = (): PhotoGenerationDraft => ({
  mode: "photo",
  photo: null,
  caption: null,
  artist: null,
  params: null,
});

export const createLinkGenerationDraft = (): LinkGenerationDraft => ({
  mode: "link",
  link: null,
  artist: null,
  params: null,
});

export const createStyleGenerationDraft = (): StyleGenerationDraft => ({
  mode: "style",
  prompt: null,
  artist: null,
  params: null,
});

export const createFastGenerationDraft = (): FastGenerationDraft => ({
  mode: "fast",
  prompt: null,
  artist: null,
  params: null,
});


