import type { ReactNode } from "react";
import type { ChartConfig } from "@/components/ui/chart";
import { formatBytes } from "@/lib/format";

/**
 * Tooltip row for byte values: swatch + label (text ink) + size.
 * Plug into <ChartTooltipContent formatter={bytesTooltip(config)} />.
 */
export function bytesTooltip(config: ChartConfig) {
  return function BytesRow(
    value: unknown,
    name: unknown,
    item: { color?: string },
  ): ReactNode {
    const key = String(name);
    return (
      <div className="flex w-full items-center gap-2">
        <span
          aria-hidden
          className="size-2.5 shrink-0"
          style={{ background: item.color }}
        />
        <span className="text-muted-foreground">
          {config[key]?.label ?? key}
        </span>
        <span className="ml-auto font-mono font-medium tabular-nums text-foreground">
          {formatBytes(Number(value))}
        </span>
      </div>
    );
  };
}

export function shortDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
  });
}
