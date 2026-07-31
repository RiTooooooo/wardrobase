"use client";

import { useState } from "react";
import type { FormEvent, ReactElement } from "react";

import { useRouter } from "next/navigation";

import { ImageUpload } from "@/components/features/item/ImageUpload";
import { SeasonPicker } from "@/components/features/item/SeasonPicker";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import { TextareaField } from "@/components/ui/TextareaField";
import type { Category } from "@/domain/item/category";
import type { Season } from "@/domain/item/season";
import { toFieldErrors } from "@/lib/formErrors";
import { createItemSchema } from "@/schemas/item";

import { createItemAction } from "@/app/items/new/actions";
import {
  CATEGORY_OPTIONS,
  COLOR_OPTIONS,
  subCategoryOptionsOf,
  subCategoryPlaceholder,
} from "./itemFormOptions";
import styles from "./ItemForm.module.css";

export function ItemForm(): ReactElement {
  const router = useRouter();
  const [category, setCategory] = useState<Category | "">("");
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [imagePath, setImagePath] = useState<string | undefined>(undefined);
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

    const formData = new FormData(event.currentTarget);
    const parsed = createItemSchema.safeParse({
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
    });

    if (!parsed.success) {
      setFieldErrors(toFieldErrors(parsed.error));
      return;
    }

    setFieldErrors({});
    setIsPending(true);
    const result = await createItemAction(parsed.data);
    setIsPending(false);

    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    router.push("/wardrobe");
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <ImageUpload
        disabled={isPending}
        onUploaded={(key) => setImagePath(key)}
        onRemoved={() => setImagePath(undefined)}
      />
      <TextField
        id="name"
        name="name"
        label="アイテム名"
        type="text"
        placeholder="ヘビーウェイトTシャツ"
        error={fieldErrors.name}
        disabled={isPending}
      />
      <div className={styles.row}>
        <SelectField
          id="category"
          name="category"
          label="カテゴリ"
          options={CATEGORY_OPTIONS}
          placeholder="選択してください"
          error={fieldErrors.category}
          disabled={isPending}
          onChange={(value) => {
            setCategory(value as Category | "");
          }}
        />
        <SelectField
          id="subCategory"
          name="subCategory"
          label="サブカテゴリ"
          options={subCategoryOptionsOf(category)}
          placeholder={subCategoryPlaceholder(category)}
          error={fieldErrors.subCategory}
          disabled={isPending || category === ""}
        />
      </div>
      <div className={styles.row}>
        <SelectField
          id="color"
          name="color"
          label="色"
          options={COLOR_OPTIONS}
          placeholder="選択してください"
          error={fieldErrors.color}
          disabled={isPending}
        />
        <TextField
          id="brand"
          name="brand"
          label="ブランド"
          type="text"
          optional
          placeholder="CIOTA"
          error={fieldErrors.brand}
          disabled={isPending}
        />
      </div>
      <SeasonPicker
        selected={seasons}
        disabled={isPending}
        onToggle={toggleSeason}
      />
      <div className={styles.row}>
        <TextField
          id="price"
          name="price"
          label="購入価格（円）"
          type="number"
          optional
          placeholder="12000"
          error={fieldErrors.price}
          disabled={isPending}
        />
        <TextField
          id="purchasedAt"
          name="purchasedAt"
          label="購入日"
          type="date"
          optional
          error={fieldErrors.purchasedAt}
          disabled={isPending}
        />
      </div>
      <TextareaField
        id="memo"
        name="memo"
        label="メモ"
        error={fieldErrors.memo}
        disabled={isPending}
      />
      {formError ? (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      ) : null}
      <div className={styles.actions}>
        <Button type="submit" disabled={isPending}>
          {isPending ? "登録中" : "登録する"}
        </Button>
      </div>
    </form>
  );
}
