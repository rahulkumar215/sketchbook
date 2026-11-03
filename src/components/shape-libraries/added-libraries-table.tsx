"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDeleteDialog } from "@/components/forms/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { timeAgo } from "@/lib/format";
import type { AddedShapeLibrary } from "@/lib/types";

type Props = {
  libraries: AddedShapeLibrary[];
  onRemove: (library: AddedShapeLibrary) => Promise<void>;
};

/** Added libraries, each with a confirmed Remove. */
export function AddedLibrariesTable({ libraries, onRemove }: Props) {
  const [removing, setRemoving] = useState<AddedShapeLibrary | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="w-28">Added</TableHead>
            <TableHead className="w-24">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {libraries.map((library) => (
            <TableRow key={library.id}>
              <TableCell className="max-w-0 truncate font-medium">
                {library.name}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {timeAgo(library.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setRemoving(library)}
                  aria-label={`Remove ${library.name}`}
                >
                  <Trash2 data-icon="inline-start" />
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ConfirmDeleteDialog
        open={removing !== null}
        title={`Remove "${removing?.name ?? ""}"?`}
        description="Its shapes stop appearing in the Library panel (in tabs already open, after a reload). Shapes you've already placed in drawings stay. You can add it again any time."
        confirmLabel="Remove library"
        onOpenChange={(open) => {
          if (!open) setRemoving(null);
        }}
        onConfirm={() => {
          if (removing) void onRemove(removing);
          setRemoving(null);
        }}
      />
    </>
  );
}
