"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, ReactElement } from "react";

import { getUploadUrlAction } from "@/app/(app)/items/new/uploadActions";

import { isAllowedImageType, resizeImage } from "./imageResize";
import styles from "./ImageUpload.module.css";

type Props = {
  disabled: boolean;
  initialImageUrl?: string;
  onUploaded: (key: string) => void;
  onRemoved: () => void;
};

type UploadState = "idle" | "processing" | "uploading" | "done";

function initialState(url: string | undefined): {
  state: UploadState;
  preview: string | null;
} {
  return url ? { state: "done", preview: url } : { state: "idle", preview: null };
}

function isInputBusy(state: UploadState): boolean {
  return state === "processing" || state === "uploading";
}

export function ImageUpload({
  disabled,
  initialImageUrl,
  onUploaded,
  onRemoved,
}: Props): ReactElement {
  const init = initialState(initialImageUrl);
  const [state, setState] = useState<UploadState>(init.state);
  const [previewUrl, setPreviewUrl] = useState<string | null>(init.preview);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleRemove(): void {
    setPreviewUrl(null);
    setState("idle");
    setError("");
    onRemoved();
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");

    if (!isAllowedImageType(file)) {
      setError("JPEG・PNG・WebP のみ対応しています");
      return;
    }

    await processAndUpload(file);
  }

  async function processAndUpload(file: File): Promise<void> {
    setState("processing");
    const { blob, contentType } = await resizeImage(file);

    setPreviewUrl(URL.createObjectURL(blob));
    setState("uploading");

    const result = await getUploadUrlAction(contentType, blob.size);
    if (!result.ok) {
      setError(result.message);
      setState("idle");
      return;
    }

    const response = await fetch(result.url, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: blob,
    });

    if (!response.ok) {
      setError("アップロードに失敗しました");
      setState("idle");
      return;
    }

    setState("done");
    onUploaded(result.key);
  }

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>
        写真<span className={styles.optional}>（任意）</span>
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className={styles.hidden}
        onChange={handleFileChange}
        disabled={disabled || isInputBusy(state)}
      />
      {previewUrl ? (
        <UploadedPreview
          previewUrl={previewUrl}
          state={state}
          disabled={disabled}
          onRemove={handleRemove}
        />
      ) : (
        <Dropzone
          disabled={disabled}
          state={state}
          onClickSelect={() => inputRef.current?.click()}
        />
      )}
      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}

function stateMessage(state: UploadState): string | null {
  if (state === "processing") return "画像を処理中...";
  if (state === "uploading") return "アップロード中...";
  return null;
}

function handleKeyDown(onClickSelect: () => void) {
  return (e: React.KeyboardEvent): void => {
    if (e.key === "Enter" || e.key === " ") onClickSelect();
  };
}

function dropzoneProps(isDisabled: boolean, onClickSelect: () => void): Record<string, unknown> {
  if (isDisabled) return {};
  return { onClick: onClickSelect, onKeyDown: handleKeyDown(onClickSelect) };
}

function Dropzone({ disabled, onClickSelect, state }: {
  disabled: boolean; onClickSelect: () => void; state: UploadState;
}): ReactElement {
  const message = stateMessage(state);
  const isDisabled = disabled || message !== null;
  const zoneClass = `${styles.dropzone} ${isDisabled ? styles.dropzoneDisabled : ""}`;
  const text = message ?? "クリックして写真を選択";
  const textClass = message ? styles.uploading : styles.dropzoneText;
  return (
    <div className={zoneClass} role="button" tabIndex={0} {...dropzoneProps(isDisabled, onClickSelect)}>
      <p className={textClass}>{text}</p>
    </div>
  );
}

function UploadedPreview({ previewUrl, state, disabled, onRemove }: {
  previewUrl: string; state: UploadState; disabled: boolean; onRemove: () => void;
}): ReactElement {
  return (
    <div className={styles.preview}>
      <img className={styles.previewImage} src={previewUrl} alt="プレビュー" />
      {state === "uploading" ? (
        <p className={styles.uploading}>アップロード中...</p>
      ) : null}
      {state === "done" && !disabled ? (
        <button type="button" className={styles.removeButton} onClick={onRemove} aria-label="写真を削除">
          ✕
        </button>
      ) : null}
    </div>
  );
}
