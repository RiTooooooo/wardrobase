import type { ReactElement } from "react";

import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import type { Category } from "@/domain/item/category";

import {
  CATEGORY_OPTIONS,
  COLOR_OPTIONS,
  subCategoryOptionsOf,
  subCategoryPlaceholder,
} from "./itemFormOptions";
import styles from "./ItemForm.module.css";

type InitialValues = {
  name?: string;
  category?: string;
  subCategory?: string | null;
  color?: string;
  brand?: string | null;
};

type FieldState = {
  errors: Record<string, string>;
  disabled: boolean;
};

export function NameField({ iv, errors, disabled }: {
  iv: InitialValues | undefined;
} & FieldState): ReactElement {
  return (
    <TextField
      id="name" name="name" label="アイテム名" type="text"
      placeholder="ヘビーウェイトTシャツ"
      defaultValue={iv?.name}
      error={errors.name} disabled={disabled}
    />
  );
}

export function CategoryRow({ iv, category, errors, disabled, onCategoryChange }: {
  iv: InitialValues | undefined;
  category: Category | "";
  onCategoryChange: (c: Category | "") => void;
} & FieldState): ReactElement {
  return (
    <div className={styles.row}>
      <SelectField
        id="category" name="category" label="カテゴリ"
        options={CATEGORY_OPTIONS} placeholder="選択してください"
        defaultValue={iv?.category}
        error={errors.category} disabled={disabled}
        onChange={(v) => onCategoryChange(v as Category | "")}
      />
      <SelectField
        id="subCategory" name="subCategory" label="サブカテゴリ"
        options={subCategoryOptionsOf(category)}
        placeholder={subCategoryPlaceholder(category)}
        defaultValue={iv?.subCategory ?? undefined}
        error={errors.subCategory}
        disabled={disabled || category === ""}
      />
    </div>
  );
}

export function ColorBrandRow({ iv, errors, disabled }: {
  iv: InitialValues | undefined;
} & FieldState): ReactElement {
  return (
    <div className={styles.row}>
      <SelectField
        id="color" name="color" label="色"
        options={COLOR_OPTIONS} placeholder="選択してください"
        defaultValue={iv?.color}
        error={errors.color} disabled={disabled}
      />
      <TextField
        id="brand" name="brand" label="ブランド" type="text" optional
        placeholder="CIOTA"
        defaultValue={iv?.brand ?? undefined}
        error={errors.brand} disabled={disabled}
      />
    </div>
  );
}

export function PriceDateRow({ priceDef, dateDef, errors, disabled }: {
  priceDef: string | undefined;
  dateDef: string | undefined;
} & FieldState): ReactElement {
  return (
    <div className={styles.row}>
      <TextField
        id="price" name="price" label="購入価格（円）" type="number" optional
        placeholder="12000"
        defaultValue={priceDef}
        error={errors.price} disabled={disabled}
      />
      <TextField
        id="purchasedAt" name="purchasedAt" label="購入日" type="date" optional
        defaultValue={dateDef}
        error={errors.purchasedAt} disabled={disabled}
      />
    </div>
  );
}
