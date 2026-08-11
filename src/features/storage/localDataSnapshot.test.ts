import { describe, expect, it } from "vitest";
import {
  LIBRARY_STATE_BACKUP_STORAGE_KEY,
  LIBRARY_STATE_STORAGE_KEY,
  createEmptyLibraryState,
  toggleFavoriteArticle
} from "../library/readingState";
import {
  READER_FONT_SIZE_STORAGE_KEY,
  READER_THEME_STORAGE_KEY
} from "../preferences/readerPreferences";
import {
  loadLocalDataFallback,
  tryLoadPrimaryLocalData
} from "./localDataSnapshot";

class MemoryStorage {
  readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  set(key: string, value: unknown): void {
    this.values.set(key, JSON.stringify(value));
  }
}

describe("localStorage migration snapshot", () => {
  it("returns a complete valid v0.5 primary snapshot", () => {
    const storage = new MemoryStorage();
    const libraryState = toggleFavoriteArticle(
      createEmptyLibraryState(),
      "article-a"
    );
    storage.set(LIBRARY_STATE_STORAGE_KEY, libraryState);
    storage.set(READER_THEME_STORAGE_KEY, "night");
    storage.set(READER_FONT_SIZE_STORAGE_KEY, 29);

    expect(tryLoadPrimaryLocalData(storage)).toEqual({
      libraryState,
      preferences: { theme: "night", fontSize: 29 }
    });
  });

  it("does not let a corrupt primary overwrite a future IndexedDB copy", () => {
    const storage = new MemoryStorage();
    const safetyCopy = toggleFavoriteArticle(
      createEmptyLibraryState(),
      "safe-article"
    );
    storage.values.set(LIBRARY_STATE_STORAGE_KEY, "corrupt-json");
    storage.set(LIBRARY_STATE_BACKUP_STORAGE_KEY, safetyCopy);
    storage.set(READER_THEME_STORAGE_KEY, "paper");
    storage.set(READER_FONT_SIZE_STORAGE_KEY, 25);

    expect(tryLoadPrimaryLocalData(storage)).toBeNull();
    expect(loadLocalDataFallback(storage).libraryState).toEqual(safetyCopy);
  });

  it("uses safe preference defaults when local settings are missing", () => {
    const storage = new MemoryStorage();

    expect(loadLocalDataFallback(storage)).toEqual({
      libraryState: createEmptyLibraryState(),
      preferences: { theme: "paper", fontSize: 25 }
    });
    expect(tryLoadPrimaryLocalData(storage)).toBeNull();
  });
});
