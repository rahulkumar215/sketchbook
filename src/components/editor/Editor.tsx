"use client";

import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types";
import { FileX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EditorHeader } from "./EditorHeader";
import { EditorSpinner } from "./EditorSpinner";
import { useAutosave } from "./useAutosave";
import { useShapeLibraries } from "./useShapeLibraries";
import { useStoredImages } from "./useStoredImages";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { apiFetch, toErrorMessage } from "@/lib/client-api";
import type { DrawingScene } from "@/lib/types";

/** Saved scene -> Excalidraw's initialData (data came from Excalidraw). */
function toInitialData(scene: DrawingScene): ExcalidrawInitialDataState {
  const appState = scene.appState as Partial<AppState>;
  return {
    elements: scene.elements as ExcalidrawElement[],
    appState,
    scrollToContent: appState.scrollX === undefined,
  };
}

function Canvas({ scene }: { scene: DrawingScene }) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const autosave = useAutosave(scene.id, scene.fileIds);
  const initialData = useMemo(() => toInitialData(scene), [scene]);
  useStoredImages(api, scene.id, scene.fileIds);
  const loadLibrariesIfOpen = useShapeLibraries(api);

  function handleChange(
    elements: readonly ExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles,
  ) {
    autosave.onChange(elements, appState, files);
    loadLibrariesIfOpen(appState);
  }

  async function handleBack() {
    await autosave.flush();
    router.push("/");
  }

  function handleRename(title: string) {
    apiFetch(`/api/drawings/${scene.id}`, {
      method: "PATCH",
      json: { title },
    }).catch((e: unknown) =>
      toast.error(`Title not saved: ${toErrorMessage(e)}`),
    );
  }

  return (
    <div className="flex h-dvh flex-col">
      <EditorHeader
        title={scene.title}
        status={autosave.status}
        error={autosave.error}
        onBack={handleBack}
        onRename={handleRename}
        onRetry={() => void autosave.flush()}
      />
      <div className="min-h-0 flex-1">
        <Excalidraw
          initialData={initialData}
          excalidrawAPI={setApi}
          onChange={handleChange}
          name={scene.title}
          theme={resolvedTheme === "dark" ? "dark" : "light"}
          UIOptions={{ canvasActions: { loadScene: false } }}
        />
      </div>
    </div>
  );
}

function OpenError({ message }: { message: string }) {
  return (
    <Empty className="h-dvh">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileX />
        </EmptyMedia>
        <EmptyTitle>This drawing couldn&rsquo;t be opened</EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild variant="outline">
          <Link href="/">Back to all drawings</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}

export default function Editor({ id }: { id: string }) {
  const [scene, setScene] = useState<DrawingScene | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<DrawingScene>(`/api/drawings/${id}`)
      .then(setScene)
      .catch((e: unknown) => setError(toErrorMessage(e)));
  }, [id]);

  if (error) return <OpenError message={error} />;
  if (!scene) return <EditorSpinner label="Opening drawing" />;
  return <Canvas scene={scene} />;
}
