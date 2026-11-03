import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type {
  AppState,
  BinaryFileData,
  DataURL,
} from "@excalidraw/excalidraw/types";
import type { StoredFile } from "@/lib/types";

/** The parts of Excalidraw's UI state worth remembering per drawing. */
const SAVED_KEYS = [
  "viewBackgroundColor",
  "gridModeEnabled",
  "gridSize",
  "gridStep",
  "scrollX",
  "scrollY",
  "zoom",
] as const satisfies readonly (keyof AppState)[];

/** Changing only these (not scroll/zoom) is worth a save on its own. */
const SETTING_KEYS = SAVED_KEYS.slice(0, 4);

export type SavedAppState = Pick<AppState, (typeof SAVED_KEYS)[number]>;

export function pickAppState(appState: AppState): SavedAppState {
  const picked: Partial<SavedAppState> = {};
  for (const key of SAVED_KEYS) {
    Object.assign(picked, { [key]: appState[key] });
  }
  return picked as SavedAppState;
}

export function settingsKey(appState: AppState): string {
  return JSON.stringify(SETTING_KEYS.map((key) => appState[key]));
}

export function liveElements(
  elements: readonly ExcalidrawElement[],
): ExcalidrawElement[] {
  return elements.filter((el) => !el.isDeleted);
}

/** Ids of images actually placed in the scene. */
export function referencedFileIds(elements: readonly ExcalidrawElement[]) {
  const ids = new Set<string>();
  for (const el of elements) {
    if (el.type === "image" && el.fileId) ids.add(el.fileId);
  }
  return ids;
}

/** Our stored image -> Excalidraw's file type (branded strings). */
export function toBinaryFile(file: StoredFile): BinaryFileData {
  return {
    id: file.id as BinaryFileData["id"],
    mimeType: file.mimeType as BinaryFileData["mimeType"],
    dataURL: file.dataURL as DataURL,
    created: file.created,
  };
}
