/**
 * Excalidraw libraries bundled with the app, served from
 * `public/libraries/<name>.json` and loaded into every drawing's Library
 * panel. Sourced from libraries.excalidraw.com
 * (github.com/excalidraw/excalidraw-libraries, MIT).
 *
 * To add one: copy the `.excalidrawlib` file into `public/libraries/` as
 * `<kebab-case-name>.json` and list it here. The `.json` extension makes the
 * CDN serve it compressed (a `.excalidrawlib` goes out uncompressed).
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

export function libraryUrl(name: string): string {
  return `/libraries/${name}.json`;
}
