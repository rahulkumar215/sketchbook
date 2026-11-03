"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Inbox } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import {
  ChoiceLabel,
  FolderChoiceItems,
  folderChoiceLabel,
} from "./folder-choices";
import { TagInput } from "./tag-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type { FolderChoice } from "@/lib/folder-tree";
import type { LibraryDrawing } from "@/lib/types";
import { drawingDetailsSchema, type DrawingDetails } from "@/lib/validators";

/** Radix Select can't hold "" as a value, so "no folder" gets a sentinel. */
const UNFILED_VALUE = "__unfiled__";

const UNFILED_LABEL = { icon: Inbox, text: "Unfiled" };

type Props = {
  drawing: LibraryDrawing | null;
  folderOptions: FolderChoice[];
  tagSuggestions: string[];
  /** Resolve true to close the dialog. */
  onSave: (id: string, details: DrawingDetails) => Promise<boolean>;
  onOpenChange: (open: boolean) => void;
};

/** Rename a drawing, move it to a folder, and edit its tags. */
export function EditDrawingDialog(props: Props) {
  return (
    <Dialog open={props.drawing !== null} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Drawing details</DialogTitle>
          <DialogDescription>Title, folder and tags.</DialogDescription>
        </DialogHeader>
        {props.drawing ? (
          <EditDrawingForm {...props} drawing={props.drawing} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function EditDrawingForm({
  drawing,
  folderOptions,
  tagSuggestions,
  onSave,
  onOpenChange,
}: Props & { drawing: LibraryDrawing }) {
  const form = useForm<DrawingDetails>({
    resolver: zodResolver(drawingDetailsSchema),
    defaultValues: {
      title: drawing.title,
      folderId: drawing.folderId,
      tags: drawing.tags,
    },
  });

  async function handleSubmit(values: DrawingDetails) {
    if (await onSave(drawing.id, values)) onOpenChange(false);
  }

  return (
    <form id="drawing-details-form" onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="drawing-title">Title</FieldLabel>
              <Input
                {...field}
                id="drawing-title"
                autoComplete="off"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />
        <Controller
          name="folderId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="drawing-folder">Folder</FieldLabel>
              <Select
                name={field.name}
                value={field.value ?? UNFILED_VALUE}
                onValueChange={(next) => {
                  if (!next) return; // Radix fires "" when items re-render
                  field.onChange(next === UNFILED_VALUE ? null : next);
                }}
              >
                <SelectTrigger
                  id="drawing-folder"
                  aria-invalid={fieldState.invalid}
                  className="w-full"
                >
                  <SelectValue>
                    {folderChoiceLabel(
                      folderOptions,
                      field.value ?? UNFILED_VALUE,
                      UNFILED_LABEL,
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={UNFILED_VALUE}>
                      <ChoiceLabel {...UNFILED_LABEL} />
                    </SelectItem>
                  </SelectGroup>
                  {folderOptions.length > 0 ? <SelectSeparator /> : null}
                  <SelectGroup>
                    <FolderChoiceItems choices={folderOptions} />
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          )}
        />
        <Controller
          name="tags"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="drawing-tags">Tags</FieldLabel>
              <TagInput
                id="drawing-tags"
                value={field.value}
                suggestions={tagSuggestions}
                invalid={fieldState.invalid}
                onChange={field.onChange}
              />
              <FieldDescription>
                Tags are saved in lowercase. Click a tag on the library page to
                filter by it.
              </FieldDescription>
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <Spinner data-icon="inline-start" />
            ) : null}
            Save
          </Button>
        </DialogFooter>
      </FieldGroup>
    </form>
  );
}
