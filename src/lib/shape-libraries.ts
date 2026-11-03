/**
 * Excalidraw shape libraries shown in every drawing's Library panel.
 *
 * Two kinds, both fetched by the browser (never stored in the database):
 * - Bundled: shipped in `public/libraries/<name>.json`, from
 *   libraries.excalidraw.com (github.com/excalidraw/excalidraw-libraries,
 *   MIT). To add one, copy its `.excalidrawlib` there as
 *   `<kebab-case-name>.json` and list it below. The `.json` extension makes
 *   the CDN serve it compressed (a `.excalidrawlib` goes out uncompressed).
 * - Added: picked with "Browse libraries" in the editor. Only the library's
 *   URL is saved (table `shape_libraries`).
 */
export const BUNDLED_LIBRARIES = [
  "architecture-diagram-components",
  "awesome-icons",
  "aws-architecture-icons",
  "cloud",
  "computers",
  "data-viz",
  "decision-flow-control",
  "dev-ops",
  "drwnio",
  "forms",
  "lo-fi-wireframing-kit",
  "software-architecture",
  "stick-figures",
  "system-design",
  "systems-design-components",
] as const;

/** Changes whenever a bundled file does (computed in next.config.ts). */
const LIBRARIES_VERSION = process.env.NEXT_PUBLIC_LIBRARIES_VERSION ?? "dev";

export function bundledLibraryUrl(name: string): string {
  // The version keeps the year-long browser cache from serving a stale file.
  return `/libraries/${name}.json?v=${LIBRARIES_VERSION}`;
}

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
