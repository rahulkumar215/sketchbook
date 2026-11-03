"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { bytesTooltip, shortDate } from "./chart-format";
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

/** A different entity (total content) from the breakdown, so it uses primary. */
const CONFIG = {
  bytes: { label: "Content size", color: "var(--primary)" },
} satisfies ChartConfig;

/** Single series: the title names it, so no legend box. */
export function GrowthChart({ points }: { points: UsageData["growth"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content growth</CardTitle>
        <CardDescription>
          Total size of drawings and images, by the day they were created.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {points.length < 2 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Not enough history yet. Check back after a few days of notes.
          </p>
        ) : (
          <ChartContainer config={CONFIG} className="aspect-auto h-64 w-full">
            <AreaChart data={points} margin={{ left: 4, right: 12, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                minTickGap={32}
                tickFormatter={shortDate}
              />
              <YAxis
                width={64}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => formatBytes(v)}
              />
              <ChartTooltip
                cursor
                content={
                  <ChartTooltipContent
                    labelFormatter={(v) => shortDate(String(v))}
                    formatter={bytesTooltip(CONFIG)}
                  />
                }
              />
              <Area
                dataKey="bytes"
                type="stepAfter"
                stroke="var(--color-bytes)"
                strokeWidth={2}
                fill="var(--color-bytes)"
                fillOpacity={0.15}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
