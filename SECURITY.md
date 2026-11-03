# Security

## Reporting a vulnerability

Please **don't open a public issue** for a security problem. Report it
privately through GitHub instead: go to the repository's **Security** tab and
click **Report a vulnerability**. Include what you found, how to reproduce
it, and what an attacker could do with it.

You'll get a reply as soon as possible. Once a fix is released, you're
welcome to be credited in the advisory.

Only the latest version on the `main` branch gets security fixes.

## Security model

Sketchbook is a **single-user** app. Knowing that helps you judge what is and
isn't in scope.

- **One password.** `APP_PASSWORD` unlocks everything; there are no accounts,
  roles or sharing. Anyone with the password has full access.
- **Session cookie.** Signing in sets an `HttpOnly`, `SameSite=Lax` cookie
  (`Secure` in production) holding a JWT signed with `SESSION_SECRET`. It
  lasts 30 days. Changing `APP_PASSWORD` or `SESSION_SECRET` signs out every
  session.
- **Startup checks.** The app refuses to start if either secret is missing,
  still the example value from `.env.example`, or too short (password under
  12 characters, secret under 32).
- **Sign-in rate limit.** After 10 failed attempts in 15 minutes, an IP
  address is blocked for the rest of that window (HTTP 429). The count is
  stored in the database, so it holds across serverless instances. The IP
  comes from `X-Forwarded-For`; on Vercel the platform sets that header. If
  you host it elsewhere, run it behind a proxy that sets `X-Forwarded-For`,
  otherwise clients can fake their IP and skip the limit.
- **Every page and API route** requires the session cookie, except the
  sign-in page and the sign-in endpoint.
- **Uploaded images** are served with `X-Content-Type-Options: nosniff` and a
  sandboxing Content-Security-Policy, so an SVG opened directly can't run
  scripts on the app's origin.
- **Headers.** Every response forbids framing (clickjacking) and MIME
  sniffing.

### Known limits

- There is no full Content-Security-Policy yet: Excalidraw loads fonts and
  libraries from other origins, so a strict policy needs careful testing.
- Signing out clears the cookie in that browser only. To end sessions
  everywhere, change `APP_PASSWORD` or `SESSION_SECRET`.
