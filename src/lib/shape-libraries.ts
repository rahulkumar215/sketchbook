/**
 * Excalidraw shape libraries shown in every drawing's Library panel.
 *
 * Each one is a row in `shape_libraries` holding only the library's URL on
 * libraries.excalidraw.com (MIT); the browser fetches the file itself, so
 * libraries never take database space. Rows come from "Browse libraries"
 * in the editor, plus 15 defaults seeded by a migration, and are removed
 * on the Shape libraries page.
 */
const LIBRARY_HOST = "libraries.excalidraw.com";
const LIBRARY_REPO = "/excalidraw/excalidraw-libraries/";

/**
 * Only the official library directory (or its GitHub repo) can be added,
 * the same rule Excalidraw applies, so a crafted link can't make the app
 * fetch from anywhere else.
 */
export function isAllowedLibraryUrl(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  if (url.hostname === LIBRARY_HOST) return true;
  return (
    url.hostname === "raw.githubusercontent.com" &&
    url.pathname.startsWith(LIBRARY_REPO)
  );
}

/** ".../youritjang/software-architecture.excalidrawlib" -> "software-architecture" */
export function libraryNameFromUrl(raw: string): string {
  const file = new URL(raw).pathname.split("/").pop() ?? "";
  const name = decodeURIComponent(file).replace(/\.excalidrawlib$/, "");
  return name || "library";
}
