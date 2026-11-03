import { Spinner } from "@/components/ui/spinner";

export function EditorSpinner({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="flex h-dvh items-center justify-center text-muted-foreground"
    >
      <Spinner className="size-6" />
    </div>
  );
}
