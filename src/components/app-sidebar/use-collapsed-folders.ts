"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * Which sidebar folders are collapsed, remembered per browser. A device
 * preference, not data, so it lives in localStorage rather than the DB.
 */
const KEY = "sketchbook:collapsed-folders";
const CHANGED = "sketchbook:collapsed-folders-changed";
const NONE = "[]";

// This tab's copy. Also the fallback when storage is blocked (private
// mode), so collapsing still works for the session, just unsaved.
let cache: string | null = null;

function read(): string {
  if (cache === null) {
    try {
      cache = localStorage.getItem(KEY) ?? NONE;
    } catch {
      cache = NONE;
    }
  }
  return cache;
}

function write(ids: Set<string>) {
  cache = JSON.stringify([...ids]);
  try {
    localStorage.setItem(KEY, cache);
  } catch {
    // blocked or full: keep the in-memory copy
  }
  window.dispatchEvent(new Event(CHANGED));
}

function subscribe(onChange: () => void) {
  // Another tab collapsed something.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    cache = e.newValue ?? NONE;
    onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGED, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGED, onChange);
  };
}

function parse(raw: string): Set<string> {
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return new Set();
    return new Set(value.filter((v): v is string => typeof v === "string"));
  } catch {
    return new Set();
  }
}

/** The server render has nothing stored, so everything starts expanded. */
const serverSnapshot = () => NONE;

export function useCollapsedFolders() {
  const raw = useSyncExternalStore(subscribe, read, serverSnapshot);
  const collapsed = useMemo(() => parse(raw), [raw]);

  const toggle = useCallback((id: string) => {
    const next = parse(read());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    write(next);
  }, []);

  /** Opens these folders; a no-op (no re-render) if all are open already. */
  const expand = useCallback((ids: Iterable<string>) => {
    const next = parse(read());
    let changed = false;
    for (const id of ids) changed = next.delete(id) || changed;
    if (changed) write(next);
  }, []);

  return { collapsed, toggle, expand };
}
