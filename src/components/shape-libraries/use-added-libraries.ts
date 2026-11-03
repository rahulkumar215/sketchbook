"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch, toErrorMessage } from "@/lib/client-api";
import { shapeLibrariesQuery } from "@/lib/queries";
import type { AddedShapeLibrary } from "@/lib/types";

type Load =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; libraries: AddedShapeLibrary[] };

function useLoad(): Load {
  const { data, error } = useQuery(shapeLibrariesQuery);
  if (data) return { status: "ready", libraries: data };
  if (error) return { status: "error", message: toErrorMessage(error) };
  return { status: "loading" };
}

/** The libraries added with "Browse libraries", and a way to remove one. */
export function useAddedLibraries() {
  const queryClient = useQueryClient();
  const { queryKey } = shapeLibrariesQuery;

  const removal = useMutation({
    mutationFn: (library: AddedShapeLibrary) =>
      apiFetch(`/api/shape-libraries/${library.id}`, { method: "DELETE" }),
    onSuccess: (_, library) => {
      // Drop the row now; the refetch confirms it.
      queryClient.setQueryData(queryKey, (old) =>
        old?.filter((l) => l.id !== library.id),
      );
      toast.success(`Removed "${library.name}"`);
      return queryClient.invalidateQueries({ queryKey });
    },
    onError: (e, library) => {
      toast.error(`Couldn't remove "${library.name}": ${toErrorMessage(e)}`);
    },
  });

  // Errors are toasted above, so the caller never needs to catch.
  const remove = (library: AddedShapeLibrary) =>
    removal.mutateAsync(library).then(
      () => undefined,
      () => undefined,
    );

  return { load: useLoad(), remove };
}
