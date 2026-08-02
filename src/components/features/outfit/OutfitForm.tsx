"use client";

import { useState } from "react";
import type { FormEvent, ReactElement } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { TextareaField } from "@/components/ui/TextareaField";
import { toFieldErrors } from "@/lib/formErrors";
import type { CreateOutfitInput } from "@/schemas/outfit";
import { createOutfitSchema } from "@/schemas/outfit";

import { ItemPicker } from "./ItemPicker";
import styles from "./OutfitForm.module.css";
import type { OutfitFormValues, PickerItem } from "./outfitTypes";
import { SatisfactionPicker } from "./SatisfactionPicker";

type ActionResult = { ok: true; id: string } | { ok: false; message: string };

type Props = {
  items: PickerItem[];
  initialValues?: OutfitFormValues;
  onSubmitAction: (data: CreateOutfitInput) => Promise<ActionResult>;
  submitLabel: string;
  pendingLabel: string;
  redirectTo: string;
};

type Defaults = {
  date: string;
  itemIds: string[];
  satisfaction: number | undefined;
};

function buildDefaults(iv: OutfitFormValues | undefined): Defaults {
  if (iv === undefined) {
    return {
      date: new Date().toISOString().split("T")[0],
      itemIds: [],
      satisfaction: undefined,
    };
  }
  return { date: iv.wornOn, itemIds: iv.itemIds, satisfaction: iv.satisfaction };
}

export function OutfitForm({
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
  const [satisfaction, setSatisfaction] = useState(defs.satisfaction);
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
    const parsed = createOutfitSchema.safeParse({
      wornOn: fd.get("wornOn"),
      itemIds: selectedIds,
      satisfaction,
      weather: fd.get("weather"),
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
        id="wornOn" name="wornOn" label="日付" type="date"
        defaultValue={defs.date}
        error={fieldErrors.wornOn} disabled={isPending}
      />
      <ItemPicker
        items={items} selected={selectedIds} disabled={isPending}
        error={fieldErrors.itemIds} onToggle={toggleItem}
      />
      <SatisfactionPicker
        value={satisfaction} disabled={isPending} onSelect={setSatisfaction}
      />
      <TextField
        id="weather" name="weather" label="天気メモ" type="text" optional
        placeholder="晴れ・30℃"
        defaultValue={initialValues?.weather}
        error={fieldErrors.weather} disabled={isPending}
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
