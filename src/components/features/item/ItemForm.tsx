"use client";

import { useState } from "react";
import type { FormEvent, ReactElement } from "react";

import { useRouter } from "next/navigation";

import { ImageUpload } from "@/components/features/item/ImageUpload";
import { SeasonPicker } from "@/components/features/item/SeasonPicker";
import { Button } from "@/components/ui/Button";
import { TextareaField } from "@/components/ui/TextareaField";
import type { Category } from "@/domain/item/category";
import type { Season } from "@/domain/item/season";
import { toFieldErrors } from "@/lib/formErrors";
import type { CreateItemInput } from "@/schemas/item";
import { createItemSchema } from "@/schemas/item";

import styles from "./ItemForm.module.css";
import {
  CategoryRow,
  ColorBrandRow,
  NameField,
  PriceDateRow,
} from "./ItemFormFields";

type ActionResult = { ok: true; id: string } | { ok: false; message: string };

type InitialValues = CreateItemInput & { imageUrl?: string };

type Props = {
  initialValues?: InitialValues;
  onSubmitAction: (data: CreateItemInput) => Promise<ActionResult>;
  submitLabel: string;
  pendingLabel: string;
  redirectTo: string;
};

type Defaults = {
  category: Category | "";
  seasons: Season[];
  imagePath: string | undefined;
  imageUrl: string | undefined;
  price: string | undefined;
  purchasedAt: string | undefined;
};

function emptyDefaults(): Defaults {
  return {
    category: "",
    seasons: [],
    imagePath: undefined,
    imageUrl: undefined,
    price: undefined,
    purchasedAt: undefined,
  };
}

function fromInitial(iv: InitialValues): Defaults {
  return {
    category: iv.category,
    seasons: iv.seasons,
    imagePath: iv.imagePath,
    imageUrl: iv.imageUrl,
    price: iv.price?.toString(),
    purchasedAt: iv.purchasedAt
      ? iv.purchasedAt.toISOString().split("T")[0]
      : undefined,
  };
}

function buildDefaults(iv: InitialValues | undefined): Defaults {
  return iv === undefined ? emptyDefaults() : fromInitial(iv);
}

export function ItemForm({
  initialValues,
  onSubmitAction,
  submitLabel,
  pendingLabel,
  redirectTo,
}: Props): ReactElement {
  const router = useRouter();
  const defs = buildDefaults(initialValues);
  const [category, setCategory] = useState<Category | "">(defs.category);
  const [seasons, setSeasons] = useState<Season[]>(defs.seasons);
  const [imagePath, setImagePath] = useState(defs.imagePath);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [isPending, setIsPending] = useState(false);

  function toggleSeason(season: Season): void {
    setSeasons((current) =>
      current.includes(season)
        ? current.filter((value) => value !== season)
        : [...current, season],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormError("");
    const result = await submitForm(event.currentTarget);
    if (result !== null) router.push(redirectTo);
  }

  async function submitForm(
    form: HTMLFormElement,
  ): Promise<ActionResult | null> {
    const formData = new FormData(form);
    const parsed = createItemSchema.safeParse(collectInput(formData));
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

  function collectInput(formData: FormData): Record<string, unknown> {
    return {
      name: formData.get("name"),
      category: formData.get("category"),
      subCategory: formData.get("subCategory"),
      color: formData.get("color"),
      seasons,
      brand: formData.get("brand"),
      price: formData.get("price"),
      purchasedAt: formData.get("purchasedAt"),
      memo: formData.get("memo"),
      imagePath,
    };
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {/* 写真は入力中も見えているほうが判断しやすいので、左に留めておく */}
      <div className={styles.photo}>
        <ImageUpload
          disabled={isPending}
          initialImageUrl={defs.imageUrl}
          onUploaded={(key) => setImagePath(key)}
          onRemoved={() => setImagePath(undefined)}
        />
      </div>
      <div className={styles.fields}>
        <NameField iv={initialValues} errors={fieldErrors} disabled={isPending} />
        <CategoryRow
          iv={initialValues} category={category} errors={fieldErrors}
          disabled={isPending} onCategoryChange={setCategory}
        />
        <ColorBrandRow
          iv={initialValues} errors={fieldErrors} disabled={isPending}
        />
        <SeasonPicker
          selected={seasons} disabled={isPending} onToggle={toggleSeason}
        />
        <PriceDateRow
          priceDef={defs.price} dateDef={defs.purchasedAt}
          errors={fieldErrors} disabled={isPending}
        />
        <TextareaField
          id="memo" name="memo" label="メモ"
          defaultValue={initialValues?.memo}
          error={fieldErrors.memo} disabled={isPending}
        />
        {formError ? (
          <p className={styles.formError} role="alert">{formError}</p>
        ) : null}
        <div className={styles.actions}>
          <Button type="submit" disabled={isPending}>
            {isPending ? pendingLabel : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
