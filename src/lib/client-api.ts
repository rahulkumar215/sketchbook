"use client";

type ApiInit = Omit<RequestInit, "body"> & { json?: unknown };

function errorMessage(data: unknown, status: number): string {
  if (data && typeof data === "object" && "error" in data) {
    const { error } = data as { error: unknown };
    if (typeof error === "string") return error;
  }
  return `Request failed (${status})`;
}

/**
 * fetch() for our own API: sends/receives JSON, throws on errors with the
 * server's message, and bounces to /login when the session has expired.
 */
export async function apiFetch<T>(url: string, init: ApiInit = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  const res = await fetch(url, {
    ...rest,
    headers:
      json === undefined
        ? headers
        : { "Content-Type": "application/json", ...headers },
    body: json === undefined ? undefined : JSON.stringify(json),
  });
  if (res.status === 401) {
    // A hard navigation on purpose: this helper runs outside React.
    const login = new URL("/login", window.location.origin);
    login.searchParams.set("next", window.location.pathname);
    window.location.assign(login.href);
    throw new Error("Your session expired. Please log in again.");
  }
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) throw new Error(errorMessage(data, res.status));
  // Trusted boundary: the shape is defined by our own route handlers.
  return data as T;
}

export function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}
