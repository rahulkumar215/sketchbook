import Image from "next/image";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-start">
          <Image
            src="/logo.svg"
            alt=""
            width={40}
            height={40}
            unoptimized
            className="mb-2 size-10 rounded-md border"
            priority
          />
          <CardTitle>Sketchbook</CardTitle>
          <CardDescription>
            Enter your password to open your notes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
