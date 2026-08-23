import { afterEach, describe, expect, it, vi } from "vitest";

import { isDemoEmail } from "./demo";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isDemoEmail", () => {
  it("DEMO_USER_EMAIL が未設定なら常に false", () => {
    vi.stubEnv("DEMO_USER_EMAIL", "");

    expect(isDemoEmail("demo@example.com")).toBe(false);
  });

  it("デモのメールアドレスと一致したら true", () => {
    vi.stubEnv("DEMO_USER_EMAIL", "demo@example.com");

    expect(isDemoEmail("demo@example.com")).toBe(true);
  });

  it("大文字小文字の揺れがあっても true（保護が外れない）", () => {
    vi.stubEnv("DEMO_USER_EMAIL", "demo@example.com");

    expect(isDemoEmail("Demo@Example.com")).toBe(true);
  });

  it("別のメールアドレスなら false", () => {
    vi.stubEnv("DEMO_USER_EMAIL", "demo@example.com");

    expect(isDemoEmail("someone@example.com")).toBe(false);
  });
});
