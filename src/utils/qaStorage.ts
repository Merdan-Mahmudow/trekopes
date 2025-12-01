import { debugWarn } from "./logger";

const SELECTED_CATEGORY_KEY = "qa_selected_category";
const ACTIVE_CATEGORY_KEY = "qa_category";
const QUEST_PREFIX = "qa_quest";
const PARENT_PREFIX = "qa_parent";
const ANSWERS_PREFIX = "qa_answers";

const isBrowser = () =>
    typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const safeGetItem = (key: string): string | null => {
    if (!isBrowser()) {
        return null;
    }
    try {
        return window.localStorage.getItem(key);
    } catch (error) {
        debugWarn(`Failed to get item from localStorage: ${key}`, error);
        return null;
    }
};

const safeSetItem = (key: string, value: string) => {
    if (!isBrowser()) {
        return;
    }
    try {
        window.localStorage.setItem(key, value);
    } catch (error) {
        debugWarn(`Failed to set item in localStorage: ${key}`, error);
    }
};

const safeRemoveItem = (key: string) => {
    if (!isBrowser()) {
        return;
    }
    try {
        window.localStorage.removeItem(key);
    } catch (error) {
        debugWarn(`Failed to remove item from localStorage: ${key}`, error);
    }
};

const parseJSON = <T>(value: string | null, fallback: T): T => {
    if (!value) {
        return fallback;
    }
    try {
        return JSON.parse(value) as T;
    } catch (error) {
        debugWarn("Failed to parse JSON from localStorage", error);
        return fallback;
    }
};

const getQuestKey = (category: string) => `${QUEST_PREFIX}_${category}`;
const getParentKey = (category: string) => `${PARENT_PREFIX}_${category}`;
const getAnswersKey = (category: string, parent?: string | null) =>
    `${ANSWERS_PREFIX}_${category}_${parent ?? "root"}`;

export const qaStorage = {
    getSelectedUICategory(): string | null {
        return safeGetItem(SELECTED_CATEGORY_KEY);
    },

    setSelectedUICategory(category: string | null) {
        if (!category) {
            safeRemoveItem(SELECTED_CATEGORY_KEY);
            return;
        }
        safeSetItem(SELECTED_CATEGORY_KEY, category);
    },

    getActiveCategory(): string | null {
        return safeGetItem(ACTIVE_CATEGORY_KEY);
    },

    setActiveCategory(category: string | null) {
        if (!category) {
            safeRemoveItem(ACTIVE_CATEGORY_KEY);
            return;
        }
        safeSetItem(ACTIVE_CATEGORY_KEY, category);
    },

    getQuestSelections(category?: string): string[] {
        if (!category) return [];
        return parseJSON<string[]>(safeGetItem(getQuestKey(category)), []);
    },

    saveQuestSelections(category: string | undefined, selections: string[]) {
        if (!category) return;
        if (selections.length === 0) {
            safeRemoveItem(getQuestKey(category));
            return;
        }
        safeSetItem(getQuestKey(category), JSON.stringify(selections));
    },

    getFinalParent(category?: string): string | null {
        if (!category) return null;
        return parseJSON<string | null>(safeGetItem(getParentKey(category)), null);
    },

    saveFinalParent(category: string | undefined, parent: string | null) {
        if (!category) return;
        if (parent === null) {
            safeRemoveItem(getParentKey(category));
            return;
        }
        safeSetItem(getParentKey(category), JSON.stringify(parent));
    },

    getAnswers(category?: string, parent?: string | null): Record<number, string> {
        if (!category) return {};
        return parseJSON<Record<number, string>>(
            safeGetItem(getAnswersKey(category, parent)),
            {}
        );
    },

    saveAnswers(
        category: string | undefined,
        parent: string | null | undefined,
        answers: Record<number, string>
    ) {
        if (!category) return;
        if (!Object.keys(answers).length) {
            safeRemoveItem(getAnswersKey(category, parent));
            return;
        }
        safeSetItem(getAnswersKey(category, parent), JSON.stringify(answers));
    },

    clearAnswers(category?: string, parent?: string | null) {
        if (!category) return;
        safeRemoveItem(getAnswersKey(category, parent));
    },
};

