import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/lib/format";
import { STORAGE_LIMIT_BYTES } from "@/lib/types";

/** The dashboard's headline: storage used against the free-plan limit. */
export function StorageHero({ totalBytes }: { totalBytes: number }) {
  const percent = (totalBytes / STORAGE_LIMIT_BYTES) * 100;
  const left = Math.max(0, STORAGE_LIMIT_BYTES - totalBytes);

  return (
    <Card>
      <CardHeader>
        <CardDescription>Storage used</CardDescription>
        <CardTitle className="text-3xl font-semibold tracking-tight tabular-nums">
          {formatBytes(totalBytes)}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Progress
          value={Math.min(100, percent)}
          aria-label="Share of the free storage limit used"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="tabular-nums">
            {percent < 0.1 ? "<0.1" : percent.toFixed(1)}% of{" "}
            {formatBytes(STORAGE_LIMIT_BYTES)}
          </span>
          <span className="tabular-nums">{formatBytes(left)} left</span>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Neon&rsquo;s free plan limit. Includes ~8 MB that Postgres uses for
        itself even when empty.
      </CardFooter>
    </Card>
  );
}
