import type { CreateGenerationRequest } from "../types/webapp";
import store from "../store";
import type {
  GenerationDraft,
  GenerationDraftScenario,
  GenerationDraftPhoto,
  TextGenerationDraft,
  PhotoGenerationDraft,
  LinkGenerationDraft,
  StyleGenerationDraft,
  FastGenerationDraft,
} from "../types/generation";
import { withMoodDescription } from "./moodPrompts";
import { withGenreDescription } from "./genrePrompts";

type MetadataEntry = Record<string, unknown>;

const DEFAULT_SCENARIO_TEMPLATE_ID = "019a9cca-1d73-70d7-8a27-3a973d3f26c5";

const buildTextMetadata = (scenario: TextGenerationDraft): MetadataEntry => ({
  mode: scenario.mode,
  category: scenario.category,
  audience: scenario.audience,
  answers: scenario.answers,
  summary: scenario.summary,
  artist: scenario.artist,
});

const buildPhotoMetadata = (scenario: PhotoGenerationDraft): MetadataEntry => ({
  mode: scenario.mode,
  caption: scenario.caption,
  photo: sanitizePhoto(scenario.photo),
  artist: scenario.artist,
});

const buildLinkMetadata = (scenario: LinkGenerationDraft): MetadataEntry => ({
  mode: scenario.mode,
  link: scenario.link,
  artist: scenario.artist,
});

const buildStyleMetadata = (scenario: StyleGenerationDraft): MetadataEntry => ({
  mode: scenario.mode,
  prompt: scenario.prompt,
  artist: scenario.artist,
});

const buildFastMetadata = (scenario: FastGenerationDraft): MetadataEntry => ({
  mode: scenario.mode,
  prompt: scenario.prompt,
  artist: scenario.artist,
});

const sanitizePhoto = (
  photo: GenerationDraftPhoto | null | undefined
): GenerationDraftPhoto | null => {
  if (!photo) return null;

  return {
    source: photo.source,
    dataUrl: photo.dataUrl,
    mimeType: photo.mimeType,
    fileName: photo.fileName,
  };
};

const derivePrompt = (
  draft: GenerationDraft,
  scenario: GenerationDraftScenario | null
): string | null => {
  if (draft.prompt && draft.prompt.trim().length > 0) {
    return draft.prompt.trim();
  }

  if (!scenario) return null;

  switch (scenario.mode) {
    case "scenario": {
      if (scenario.summary && scenario.summary.trim().length > 0) {
        return scenario.summary.trim();
      }
      if (scenario.answers.length > 0) {
        return scenario.answers
          .filter((item) => item.answer?.trim())
          .map((item) => `${item.question}: ${item.answer}`)
          .join("\n");
      }
      return null;
    }
    case "photo":
      return scenario.caption?.trim() ?? null;
    case "link":
      return scenario.link
        ? `Create a personalised song based on the profile ${scenario.link}`
        : null;
    case "style":
    case "text":
      return scenario.prompt?.trim() ?? null;
    default:
      return null;
  }
};

export const buildCreateGenerationRequest = (
  draft: GenerationDraft
): CreateGenerationRequest => {
  if (!draft.type) {
    throw new Error("Не выбран тип генерации");
  }

  const scenario = draft.scenario ?? null;
  const scenarioParamsWithDescriptions = withGenreDescription(
    withMoodDescription(scenario?.params)
  );
  const scenarioWithDescriptions = scenario
    ? {
        ...scenario,
        params: scenarioParamsWithDescriptions,
      }
    : null;
  const prompt = derivePrompt(draft, scenario);

  if (!prompt || prompt.trim().length === 0) {
    throw new Error("Заполните описание для генерации");
  }

  const metadata: MetadataEntry[] = [];

  if (scenarioWithDescriptions) {
    switch (scenarioWithDescriptions.mode) {
      case "scenario":
        metadata.push(buildTextMetadata(scenarioWithDescriptions));
        break;
      case "photo":
        metadata.push(buildPhotoMetadata(scenarioWithDescriptions));
        break;
      case "link":
        metadata.push(buildLinkMetadata(scenarioWithDescriptions));
        break;
      case "style":
        metadata.push(buildStyleMetadata(scenarioWithDescriptions));
        break;
      case "text":
        metadata.push(buildFastMetadata(scenarioWithDescriptions));
        break;
      default:
        break;
    }
  }

  const request: CreateGenerationRequest = {
    prompt,
  };

  const paramsForRequest =
    scenarioWithDescriptions?.params ?? scenario?.params ?? null;
  if (paramsForRequest && typeof paramsForRequest.tempo === "number") {
    request.tempo = paramsForRequest.tempo;
  }
  if (paramsForRequest?.style) {
    request.style = paramsForRequest.style;
  }
  if (paramsForRequest?.mood) {
    request.mood = paramsForRequest.mood;
  }
  if (paramsForRequest?.voice) {
    request.voice = paramsForRequest.voice;
  }

  if (draft.type) {
    // NOTE: временно форсим тип text для сценариев, пока сервер не готов
    request.type = draft.type === "scenario" ? "text" : draft.type;
  }
  
  // Подставляем template_id для генерации по сценарию
  if (scenarioWithDescriptions?.mode === "scenario") {
    const scenarioTemplateId =
      draft.templateId ||
      store.state.templates.scenarioTemplateId ||
      DEFAULT_SCENARIO_TEMPLATE_ID;
    request.template_id = scenarioTemplateId;
  } else if (draft.templateId) {
    request.template_id = draft.templateId;
  }
  
  // Подставляем template_artist_id для генерации по стилю из выбранного артиста
  if (scenarioWithDescriptions?.mode === "style" && "artist" in scenarioWithDescriptions && scenarioWithDescriptions.artist?.id) {
    request.template_artist_id = scenarioWithDescriptions.artist.id;
  } else if (draft.templateArtistId) {
    request.template_artist_id = draft.templateArtistId;
  }
  if (metadata.length > 0) {
    request.metadata = metadata;
  }

  return request;
};

