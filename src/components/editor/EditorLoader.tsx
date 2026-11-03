"use client";

import dynamic from "next/dynamic";
import { EditorSpinner } from "./EditorSpinner";

/** Excalidraw needs `window`, so it is only ever loaded in the browser. */
const Editor = dynamic(() => import("./Editor"), {
  ssr: false,
  loading: () => <EditorSpinner label="Loading editor" />,
});

export function EditorLoader({ id }: { id: string }) {
  return <Editor id={id} />;
}
