"use client";

import { useState } from "react";
import type { ReactElement } from "react";

import { SeasonPicker } from "@/components/features/item/SeasonPicker";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { TextareaField } from "@/components/ui/TextareaField";
import type { Season } from "@/domain/item/season";

import type { BoardItem } from "./boardTypes";
import styles from "./BoardControls.module.css";

type ActionResult = { ok: true; id: string } | { ok: false; message: string };

type Props = {
  boardItems: BoardItem[];
  initialName?: string;
  initialSeasons?: Season[];
  initialMemo?: string;
  onSubmitAction: (data: unknown) => Promise<ActionResult>;
  redirectTo: string;
  isPending: boolean;
  onPendingChange: (pending: boolean) => void;
};

export function BoardControls({
  boardItems,
  initialName,
  initialSeasons,
  initialMemo,
  onSubmitAction,
  redirectTo,
  isPending,
  onPendingChange,
}: Props): ReactElement {
  const [seasons, setSeasons] = useState<Season[]>(initialSeasons ?? []);
  const [formError, setFormError] = useState("");

  function toggleSeason(season: Season): void {
    setSeasons((cur) =>
      cur.includes(season) ? cur.filter((s) => s !== season) : [...cur, season],
    );
  }

  async function handleSave(): Promise<void> {
    setFormError("");
    const name = getInputValue("board-name");
    const memo = getInputValue("board-memo");

    const input = {
      name,
      items: boardItems,
      seasons,
      memo: memo === "" ? undefined : memo,
    };

    onPendingChange(true);
    const result = await onSubmitAction(input);
    onPendingChange(false);

    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    window.location.href = redirectTo.replace(":id", result.id);
  }

  return (
    <div className={styles.controls}>
      <TextField
        id="board-name"
        name="board-name"
        label="スタイリング名"
        type="text"
        placeholder="夏の定番コーデ"
        defaultValue={initialName}
        disabled={isPending}
      />
      <SeasonPicker
        selected={seasons}
        disabled={isPending}
        onToggle={toggleSeason}
      />
      <TextareaField
        id="board-memo"
        name="board-memo"
        label="メモ"
        defaultValue={initialMemo}
        disabled={isPending}
      />
      {formError !== "" ? (
        <p className={styles.error} role="alert">{formError}</p>
      ) : null}
      <Button
        type="button"
        disabled={isPending || boardItems.length === 0}
        onClick={handleSave}
      >
        {isPending ? "保存中..." : "保存する"}
      </Button>
    </div>
  );
}

function getInputValue(id: string): string {
  const el = document.getElementById(id);
  if (el instanceof HTMLInputElement) return el.value;
  if (el instanceof HTMLTextAreaElement) return el.value;

  return "";
}
