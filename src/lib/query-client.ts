import {
  environmentManager,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { toErrorMessage } from "@/lib/client-api";

declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: {
      /** Toast this (plus the error) when the query fails with no data. */
      errorMessage?: string;
    };
  }
}

/**
 * A failed query toasts when the screen can't say so itself: a background
 * refresh failed (the old data stays on screen), or the query opted in via
 * `meta.errorMessage` because it has no inline error state.
 */
function toastQueryError(
  error: Error,
  query: { state: { data: unknown }; meta?: { errorMessage?: string } },
) {
  const hasData = query.state.data !== undefined;
  const message = query.meta?.errorMessage;
  if (!hasData && !message) return;
  toast.error(
    `${hasData ? "Couldn't refresh" : message}: ${toErrorMessage(error)}`,
  );
}

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: toastQueryError }),
    defaultOptions: {
      queries: {
        // Every write in the app invalidates what it changes, so data only
        // goes stale through other tabs or devices: refresh those on focus
        // or remount after 30 s.
        staleTime: 30 * 1000,
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * One client for the whole browser session (also reachable outside React,
 * e.g. from Excalidraw callbacks); a fresh one per server render, so no
 * data is ever shared between requests. Pattern from the TanStack Query
 * Next.js App Router guide.
 */
export function getQueryClient(): QueryClient {
  if (environmentManager.isServer()) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
