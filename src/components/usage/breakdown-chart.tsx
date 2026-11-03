"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { bytesTooltip } from "./chart-format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatBytes } from "@/lib/format";
import type { UsageData } from "@/lib/types";

/** Fixed slot per kind (colour follows the entity everywhere). */
export const KIND_CONFIG = {
  images: { label: "Images", color: "var(--chart-1)" },
  drawings: { label: "Drawings (shapes & text)", color: "var(--chart-2)" },
  other: { label: "Folders & database overhead", color: "var(--chart-3)" },
} satisfies ChartConfig;

const KINDS = ["images", "drawings", "other"] as const;

/**
 * Part-to-whole as one tall segmented bar (not a donut), with a legend that
 * doubles as the table view: every value is also printed as text.
 */
export function BreakdownChart({
  breakdown,
}: {
  breakdown: UsageData["breakdown"];
}) {
  const total = KINDS.reduce((sum, k) => sum + breakdown[k], 0) || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>What&rsquo;s using the space</CardTitle>
        <CardDescription>On-disk size, including indexes.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ChartContainer
          config={KIND_CONFIG}
          className="aspect-auto h-10 w-full"
        >
          <BarChart
            data={[{ name: "storage", ...breakdown }]}
            layout="vertical"
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <XAxis type="number" hide domain={[0, total]} />
            <YAxis type="category" dataKey="name" hide />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={bytesTooltip(KIND_CONFIG)}
                />
              }
            />
            {KINDS.map((kind, i) => (
              <Bar
                key={kind}
                dataKey={kind}
                stackId="storage"
                fill={`var(--color-${kind})`}
                stroke="var(--card)"
                strokeWidth={2}
                radius={
                  i === 0
                    ? [4, 0, 0, 4]
                    : i === KINDS.length - 1
                      ? [0, 4, 4, 0]
                      : 0
                }
              />
            ))}
          </BarChart>
        </ChartContainer>
        <ul className="grid gap-3 text-xs sm:grid-cols-3">
          {KINDS.map((kind) => (
            <li key={kind} className="flex items-start gap-2">
              <span
                aria-hidden
                className="mt-1 size-2.5 shrink-0 rounded-[2px]"
                style={{ background: KIND_CONFIG[kind].color }}
              />
              <span className="flex flex-col">
                <span className="text-muted-foreground">
                  {KIND_CONFIG[kind].label}
                </span>
                <span className="font-medium tabular-nums">
                  {formatBytes(breakdown[kind])}{" "}
                  <span className="font-normal text-muted-foreground">
                    ({((breakdown[kind] / total) * 100).toFixed(0)}%)
                  </span>
                </span>
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
