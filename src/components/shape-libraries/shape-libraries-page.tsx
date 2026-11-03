"use client";

import { Shapes } from "lucide-react";
import { AddedLibrariesTable } from "./added-libraries-table";
import { useAddedLibraries } from "./use-added-libraries";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

function NoneAdded() {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Shapes />
        </EmptyMedia>
        <EmptyTitle>No shape libraries</EmptyTitle>
        <EmptyDescription>
          In any drawing, open Library, click Browse libraries, then Add to
          Excalidraw on the one you want.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function AddedLibraries() {
  const { load, remove } = useAddedLibraries();

  if (load.status === "loading") {
    return (
      <div className="flex flex-col gap-2" aria-busy="true">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }
  if (load.status === "error") {
    return (
      <Alert variant="destructive">
        <AlertTitle>Couldn&rsquo;t load your libraries</AlertTitle>
        <AlertDescription>{load.message}</AlertDescription>
      </Alert>
    );
  }
  if (load.libraries.length === 0) return <NoneAdded />;
  return <AddedLibrariesTable libraries={load.libraries} onRemove={remove} />;
}

/** Every library in the Library panel, each removable. */
export function ShapeLibrariesPage() {
  return (
    <>
      <PageHeader
        title="Shape libraries"
        description="What every drawing's Library panel shows"
      />
      <div className="flex max-w-3xl flex-col gap-4 p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Your libraries</CardTitle>
            <CardDescription>
              From libraries.excalidraw.com. Add more in any drawing with
              Library &rarr; Browse libraries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddedLibraries />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
