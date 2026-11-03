/**
 * The two secrets the app's security rests on. Anyone can read
 * .env.example, so its placeholder values (and anything short) are
 * rejected: a copied example secret would let anyone forge a login cookie.
 */
const MIN_PASSWORD_LENGTH = 12;
const MIN_SECRET_LENGTH = 32;

/**
 * Fragments of the example values, current and past. Matched as substrings
 * because env loaders differ on quoting and escapes (dotenv keeps the \"
 * from the old example secret), so an exact match would miss a copy.
 */
const PLACEHOLDER_MARKERS = [
  "replace-with-", // current .env.example
  "choose-a-long-password", // older .env.example
  "64-hex-chars", // older .env.example
];

function isPlaceholder(value: string): boolean {
  return PLACEHOLDER_MARKERS.some((marker) => value.includes(marker));
}

function required(name: string, minLength: number): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set (see .env.example)`);
  if (isPlaceholder(value)) {
    throw new Error(`${name} is still the example value from .env.example`);
  }
  if (value.length < minLength) {
    throw new Error(`${name} must be at least ${minLength} characters`);
  }
  return value;
}

export function appPassword(): string {
  return required("APP_PASSWORD", MIN_PASSWORD_LENGTH);
}

export function sessionSecret(): string {
  return required("SESSION_SECRET", MIN_SECRET_LENGTH);
}

/** Throws with a clear message if either secret is missing or weak. */
export function assertSecureEnv(): void {
  appPassword();
  sessionSecret();
}
