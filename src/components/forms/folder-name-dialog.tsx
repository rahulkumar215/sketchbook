"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { folderFormSchema, type FolderFormValues } from "@/lib/validators";

type Props = {
  open: boolean;
  title: string;
  description: string;
  submitLabel: string;
  defaultName?: string;
  /** Resolve true to close the dialog. */
  onSubmit: (name: string) => Promise<boolean>;
  onOpenChange: (open: boolean) => void;
};

/** Create or rename a folder. */
export function FolderNameDialog(props: Props) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          <DialogDescription>{props.description}</DialogDescription>
        </DialogHeader>
        {props.open ? <FolderNameForm {...props} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function FolderNameForm({
  defaultName = "",
  submitLabel,
  onSubmit,
  onOpenChange,
}: Props) {
  const form = useForm<FolderFormValues>({
    resolver: zodResolver(folderFormSchema),
    defaultValues: { name: defaultName },
  });

  async function handleSubmit(values: FolderFormValues) {
    if (await onSubmit(values.name)) onOpenChange(false);
  }

  return (
    <form id="folder-name-form" onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="folder-name">Name</FieldLabel>
              <Input
                {...field}
                id="folder-name"
                autoFocus
                autoComplete="off"
                aria-invalid={fieldState.invalid}
              />
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
            {submitLabel}
          </Button>
        </DialogFooter>
      </FieldGroup>
    </form>
  );
}
