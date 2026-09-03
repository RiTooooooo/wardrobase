import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createViewUrl } from "./presignedUrl";

/*
 * createViewUrl のキャッシュ挙動のテスト。
 *
 * presigned URL はリクエストごとに変わるとブラウザキャッシュが効かないため、
 * 「同じ1時間の間は同じ URL を返す」ことを仕様として固定する。
 * 署名自体はネットワークに出ない純粋な計算なので、実際に生成して検証できる。
 */

const TEST_ENV = {
  S3_ENDPOINT: "http://localhost:9000",
  S3_REGION: "ap-northeast-1",
  S3_ACCESS_KEY: "test-access-key",
  S3_SECRET_KEY: "test-secret-key",
  S3_BUCKET: "test-bucket",
};

beforeEach(() => {
  for (const [key, value] of Object.entries(TEST_ENV)) {
    vi.stubEnv(key, value);
  }
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("createViewUrl", () => {
  it("同じ時間バケット内では同じ URL を返す（ブラウザキャッシュを効かせるため）", async () => {
    vi.setSystemTime(new Date("2026-09-03T12:05:00Z"));
    const first = await createViewUrl("user1/photo.jpg");

    vi.setSystemTime(new Date("2026-09-03T12:55:00Z"));
    const second = await createViewUrl("user1/photo.jpg");

    expect(second).toBe(first);
  });

  it("署名時刻は1時間単位に切り捨てられる（インスタンスをまたいでも同じ URL になる根拠）", async () => {
    vi.setSystemTime(new Date("2026-09-03T12:34:56Z"));
    const url = new URL(await createViewUrl("user1/photo.jpg"));

    expect(url.searchParams.get("X-Amz-Date")).toBe("20260903T120000Z");
  });

  it("時間バケットが変わったら新しい URL を返す", async () => {
    vi.setSystemTime(new Date("2026-09-03T12:59:00Z"));
    const before = await createViewUrl("user1/photo.jpg");

    vi.setSystemTime(new Date("2026-09-03T13:01:00Z"));
    const after = await createViewUrl("user1/photo.jpg");

    expect(after).not.toBe(before);
  });

  it("バケット終わり際の発行でも1時間以上の有効期間が残る", async () => {
    vi.setSystemTime(new Date("2026-09-03T12:59:59Z"));
    const url = new URL(await createViewUrl("user1/photo.jpg"));

    // 署名時刻（12:00）+ X-Amz-Expires が 14:00 なので、残り約1時間
    expect(Number(url.searchParams.get("X-Amz-Expires"))).toBe(7200);
  });

  it("レスポンスに Cache-Control が付くようクエリで指定する", async () => {
    vi.setSystemTime(new Date("2026-09-03T12:00:00Z"));
    const url = new URL(await createViewUrl("user1/photo.jpg"));

    expect(url.searchParams.get("response-cache-control")).toBe(
      "private, max-age=86400, immutable",
    );
  });

  it("キーが違えば URL も違う", async () => {
    vi.setSystemTime(new Date("2026-09-03T12:00:00Z"));
    const a = await createViewUrl("user1/a.jpg");
    const b = await createViewUrl("user1/b.jpg");

    expect(a).not.toBe(b);
  });
});
