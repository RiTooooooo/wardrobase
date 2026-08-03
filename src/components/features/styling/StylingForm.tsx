"use client";

import { useState } from "react";
import type { FormEvent, ReactElement } from "react";

import { useRouter } from "next/navigation";

import { ItemPicker } from "@/components/features/outfit/ItemPicker";
import type { PickerItem } from "@/components/features/outfit/outfitTypes";
import { SeasonPicker } from "@/components/features/item/SeasonPicker";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { TextareaField } from "@/components/ui/TextareaField";
import type { Season } from "@/domain/item/season";
import { toFieldErrors } from "@/lib/formErrors";
import type { CreateStylingInput } from "@/schemas/styling";
import { createStylingSchema } from "@/schemas/styling";

import styles from "./StylingForm.module.css";
import type { StylingFormValues } from "./stylingTypes";

type ActionResult = { ok: true; id: string } | { ok: false; message: string };

type Props = {
  items: PickerItem[];
  initialValues?: StylingFormValues;
  onSubmitAction: (data: CreateStylingInput) => Promise<ActionResult>;
  submitLabel: string;
  pendingLabel: string;
  redirectTo: string;
};

function buildDefaults(
  iv: StylingFormValues | undefined,
): { itemIds: string[]; seasons: Season[] } {
  if (iv === undefined) {
    return { itemIds: [], seasons: [] };
  }
  return { itemIds: iv.itemIds, seasons: iv.seasons };
}

export function StylingForm({
  items,
  initialValues,
  onSubmitAction,
  submitLabel,
  pendingLabel,
  redirectTo,
}: Props): ReactElement {
  const router = useRouter();
  const defs = buildDefaults(initialValues);
  const [selectedIds, setSelectedIds] = useState<string[]>(defs.itemIds);
  const [seasons, setSeasons] = useState<Season[]>(defs.seasons);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [isPending, setIsPending] = useState(false);

  function toggleItem(itemId: string): void {
    setSelectedIds((current) =>
      current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId],
    );
  }

  function toggleSeason(season: Season): void {
    setSeasons((current) =>
      current.includes(season)
        ? current.filter((s) => s !== season)
        : [...current, season],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormError("");
    const result = await submitForm(event.currentTarget);
    if (result !== null && result.ok) {
      router.push(redirectTo.replace(":id", result.id));
    }
  }

  async function submitForm(
    form: HTMLFormElement,
  ): Promise<ActionResult | null> {
    const fd = new FormData(form);
    const parsed = createStylingSchema.safeParse({
      name: fd.get("name"),
      itemIds: selectedIds,
      seasons,
      memo: fd.get("memo"),
    });
    if (!parsed.success) {
      setFieldErrors(toFieldErrors(parsed.error));
      return null;
    }
    setFieldErrors({});
    setIsPending(true);
    const result = await onSubmitAction(parsed.data);
    setIsPending(false);
    if (!result.ok) {
      setFormError(result.message);
      return null;
    }
    return result;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextField
        id="name" name="name" label="スタイリング名" type="text"
        placeholder="仕事の日の定番"
        defaultValue={initialValues?.name}
        error={fieldErrors.name} disabled={isPending}
      />
      <ItemPicker
        items={items} selected={selectedIds} disabled={isPending}
        error={fieldErrors.itemIds} onToggle={toggleItem}
      />
      <SeasonPicker
        selected={seasons} disabled={isPending} onToggle={toggleSeason}
      />
      <TextareaField
        id="memo" name="memo" label="メモ"
        defaultValue={initialValues?.memo}
        error={fieldErrors.memo} disabled={isPending}
      />
      <FormErrorMessage message={formError} />
      <div className={styles.actions}>
        <Button type="submit" disabled={isPending}>
          {isPending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function FormErrorMessage({
  message,
}: {
  message: string;
}): ReactElement | null {
  if (message === "") return null;

  return <p className={styles.formError} role="alert">{message}</p>;
}
