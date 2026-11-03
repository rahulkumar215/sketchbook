import { assertSecureEnv } from "@/lib/env";

/**
 * Runs once when a server instance starts: refuse to serve anything with a
 * missing, placeholder or short APP_PASSWORD / SESSION_SECRET, rather than
 * failing later (or worse, working with a guessable secret).
 */
export function register() {
  assertSecureEnv();
}
