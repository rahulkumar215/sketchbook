"use client";

import { useQuery } from "@tanstack/react-query";
import { RefreshCw, TriangleAlert } from "lucide-react";
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
import { toErrorMessage } from "@/lib/client-api";
import { usageQuery } from "@/lib/queries";
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
  const { data, error, isFetching, refetch } = useQuery(usageQuery);
  // With data on screen, a failed refresh is a toast (see query-client).
  const failed = !data && error ? toErrorMessage(error) : null;

  return (
    <>
      <PageHeader
        title="Storage & usage"
        description="How much of the free 1 GB your notes use, and what uses it."
        actions={
          <Button
            variant="outline"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            {isFetching ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <RefreshCw data-icon="inline-start" />
            )}
            Refresh
          </Button>
        }
      />
      <div className="flex flex-col gap-4 p-4 md:p-6">
        {failed ? (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertTitle>Couldn&rsquo;t load usage</AlertTitle>
            <AlertDescription>{failed}</AlertDescription>
          </Alert>
        ) : null}
        {data ? <Dashboard data={data} /> : null}
        {!data && !failed ? <DashboardSkeleton /> : null}
      </div>
    </>
  );
}
