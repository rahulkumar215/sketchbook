"use client";

import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { KIND_CONFIG } from "./breakdown-chart";
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatBytes } from "@/lib/format";
import type { UsageData } from "@/lib/types";

/** Same entities, same slots as the breakdown chart. */
const CONFIG = {
  sceneBytes: { label: "Shapes & text", color: KIND_CONFIG.drawings.color },
  imageBytes: { label: "Images", color: KIND_CONFIG.images.color },
} satisfies ChartConfig;

const ROW_PX = 34;

function truncate(text: string, max = 18): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/** Ranked horizontal bars: which drawings take the most space. */
export function LargestDrawingsChart({ rows }: { rows: UsageData["largest"] }) {
  const router = useRouter();
  const isMobile = useIsMobile();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Largest drawings</CardTitle>
        <CardDescription>
          Top {rows.length}. Click a bar to open the drawing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={CONFIG}
          className="aspect-auto w-full"
          style={{ height: rows.length * ROW_PX + 64 }}
        >
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ left: 4, right: 12 }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => formatBytes(v)}
            />
            <YAxis
              type="category"
              dataKey="title"
              width={isMobile ? 84 : 130}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: string) => truncate(v, isMobile ? 11 : 18)}
            />
            <ChartTooltip
              cursor={{ fillOpacity: 0.5 }}
              content={<ChartTooltipContent formatter={bytesTooltip(CONFIG)} />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="sceneBytes"
              stackId="size"
              fill="var(--color-sceneBytes)"
              stroke="var(--card)"
              strokeWidth={2}
              className="cursor-pointer"
              onClick={(row: { id?: string }) => {
                if (row.id) router.push(`/d/${row.id}`);
              }}
            />
            <Bar
              dataKey="imageBytes"
              stackId="size"
              fill="var(--color-imageBytes)"
              stroke="var(--card)"
              strokeWidth={2}
              radius={[0, 4, 4, 0]}
              className="cursor-pointer"
              onClick={(row: { id?: string }) => {
                if (row.id) router.push(`/d/${row.id}`);
              }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
