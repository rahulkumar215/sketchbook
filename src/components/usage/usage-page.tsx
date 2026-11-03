"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { BreakdownChart } from "./breakdown-chart";
import { GrowthChart } from "./growth-chart";
import { LargestDrawingsChart } from "./largest-drawings-chart";
import { StatCards } from "./stat-cards";
import { StorageHero } from "./storage-hero";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { apiFetch, toErrorMessage } from "@/lib/client-api";
import type { UsageData } from "@/lib/types";

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2" aria-busy="true">
      <Skeleton className="h-48" />
      <Skeleton className="h-48" />
      <Skeleton className="h-40 lg:col-span-2" />
      <Skeleton className="h-80" />
      <Skeleton className="h-80" />
    </div>
  );
}

function Dashboard({ data }: { data: UsageData }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <StorageHero totalBytes={data.totalBytes} />
      <StatCards counts={data.counts} />
      <div className="lg:col-span-2">
        <BreakdownChart breakdown={data.breakdown} />
      </div>
      {data.largest.length > 0 ? (
        <LargestDrawingsChart rows={data.largest} />
      ) : null}
      <GrowthChart points={data.growth} />
    </div>
  );
}

export function UsagePage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await apiFetch<UsageData>("/api/usage"));
      setError(null);
    } catch (e) {
      setError(toErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    apiFetch<UsageData>("/api/usage")
      .then((usage) => {
        if (active) setData(usage);
      })
      .catch((e: unknown) => {
        if (active) setError(toErrorMessage(e));
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <PageHeader
        title="Storage & usage"
        description="How much of the free 1 GB your notes use, and what uses it."
        actions={
          <Button
            variant="outline"
            onClick={() => void load()}
            disabled={loading}
          >
            {loading ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <RefreshCw data-icon="inline-start" />
            )}
            Refresh
          </Button>
        }
      />
      <div className="flex flex-col gap-4 p-4 md:p-6">
        {error ? (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertTitle>Couldn&rsquo;t load usage</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {data ? <Dashboard data={data} /> : null}
        {!data && !error ? <DashboardSkeleton /> : null}
      </div>
    </>
  );
}
