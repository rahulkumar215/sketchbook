"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { loginSchema, type LoginValues } from "@/lib/validators";

/**
 * Only allow redirects back into this app. Resolving against our own origin
 * catches every trick ("//evil.com", "/\evil.com", "https:evil.com"): if the
 * result lands on another origin, go home instead.
 */
function safeNext(next: string | null): string {
  if (!next) return "/";
  try {
    const url = new URL(next, window.location.origin);
    if (url.origin !== window.location.origin) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}

/** The server's own message, e.g. "Too many attempts. Try again in…". */
async function errorMessage(res: Response): Promise<string> {
  try {
    const body: unknown = await res.json();
    if (body && typeof body === "object" && "error" in body) {
      return String(body.error);
    }
  } catch {
    // not JSON: fall through
  }
  return "Login failed";
}

async function postLogin(values: LoginValues): Promise<string | null> {
  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) return null;
    return res.status === 401 ? "Wrong password" : await errorMessage(res);
  } catch {
    return "Couldn't reach the server. Check your connection.";
  }
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [visible, setVisible] = useState(false);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: "" },
  });

  async function handleSubmit(values: LoginValues) {
    const error = await postLogin(values);
    if (error) {
      form.setError("password", { message: error });
      return;
    }
    router.replace(safeNext(params.get("next")));
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id="password"
                  type={visible ? "text" : "password"}
                  autoFocus
                  autoComplete="current-password"
                  aria-invalid={fieldState.invalid}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    aria-label={visible ? "Hide password" : "Show password"}
                    aria-pressed={visible}
                    onClick={() => setVisible((v) => !v)}
                  >
                    {visible ? <EyeOff /> : <Eye />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <Spinner data-icon="inline-start" />
          ) : null}
          Log in
        </Button>
      </FieldGroup>
    </form>
  );
}
