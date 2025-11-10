import { useStore } from "@tanstack/react-store";
import store, {
  resetGenerationDraft,
  setGenerationDraft,
  setGenerationMetadata,
  setGenerationPrompt,
  setGenerationScenario,
  setGenerationTemplate,
  setGenerationType,
  updateGenerationScenario,
} from ".";
import type {
  GenerationDraft,
  GenerationDraftScenario,
} from "../types/generation";

export const useGenerationDraft = (): GenerationDraft =>
  useStore(store, (state) => state.generationDraft);

export const useGenerationScenario = (): GenerationDraftScenario | null =>
  useStore(store, (state) => state.generationDraft?.scenario ?? null);

export const useGenerationType = () =>
  useStore(store, (state) => state.generationDraft?.type ?? null);

export const useGenerationPrompt = () =>
  useStore(store, (state) => state.generationDraft?.prompt ?? null);

export {
  resetGenerationDraft,
  setGenerationDraft,
  setGenerationMetadata,
  setGenerationPrompt,
  setGenerationScenario,
  setGenerationTemplate,
  setGenerationType,
  updateGenerationScenario,
};

