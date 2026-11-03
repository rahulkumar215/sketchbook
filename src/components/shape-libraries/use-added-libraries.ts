"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { apiFetch, toErrorMessage } from "@/lib/client-api";
import type { AddedShapeLibrary } from "@/lib/types";

type Load =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; libraries: AddedShapeLibrary[] };

/** The libraries added with "Browse libraries", and a way to remove one. */
export function useAddedLibraries() {
  const [load, setLoad] = useState<Load>({ status: "loading" });

  useEffect(() => {
    let active = true;
    apiFetch<AddedShapeLibrary[]>("/api/shape-libraries")
      .then((libraries) => {
        if (active) setLoad({ status: "ready", libraries });
      })
      .catch((e: unknown) => {
        if (active) setLoad({ status: "error", message: toErrorMessage(e) });
      });
    return () => {
      active = false;
    };
  }, []);

  const remove = useCallback(async (library: AddedShapeLibrary) => {
    try {
      await apiFetch(`/api/shape-libraries/${library.id}`, {
        method: "DELETE",
      });
      setLoad((prev) =>
        prev.status === "ready"
          ? {
              ...prev,
              libraries: prev.libraries.filter((l) => l.id !== library.id),
            }
          : prev,
      );
      toast.success(`Removed "${library.name}"`);
    } catch (e) {
      toast.error(`Couldn't remove "${library.name}": ${toErrorMessage(e)}`);
    }
  }, []);

  return { load, remove };
}
