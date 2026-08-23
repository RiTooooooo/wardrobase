import { afterEach, describe, expect, it, vi } from "vitest";

import { isSignupEmailAllowed, isSignupOpen } from "./signupPolicy";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isSignupOpen", () => {
  it("本番ビルドでは環境変数に関係なく常に閉じる", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("AUTH_ALLOW_SIGNUP", "true");

    expect(isSignupOpen()).toBe(false);
  });

  it("開発環境でも AUTH_ALLOW_SIGNUP=true を明示しない限り閉じる", () => {
    vi.stubEnv("AUTH_ALLOW_SIGNUP", "");

    expect(isSignupOpen()).toBe(false);
  });

  it("開発環境で AUTH_ALLOW_SIGNUP=true のときだけ開く", () => {
    vi.stubEnv("AUTH_ALLOW_SIGNUP", "true");

    expect(isSignupOpen()).toBe(true);
  });
});

describe("isSignupEmailAllowed", () => {
  it("未設定なら誰も登録できない（fail-closed）", () => {
    vi.stubEnv("AUTH_SIGNUP_ALLOWED_EMAILS", "");

    expect(isSignupEmailAllowed("anyone@example.com")).toBe(false);
  });

  it("許可リストに載っているアドレスは登録できる", () => {
    vi.stubEnv("AUTH_SIGNUP_ALLOWED_EMAILS", "me@example.com, demo@example.com");

    expect(isSignupEmailAllowed("me@example.com")).toBe(true);
    expect(isSignupEmailAllowed("demo@example.com")).toBe(true);
  });

  it("許可リストにないアドレスは登録できない", () => {
    vi.stubEnv("AUTH_SIGNUP_ALLOWED_EMAILS", "me@example.com");

    expect(isSignupEmailAllowed("attacker@example.com")).toBe(false);
  });

  it("大文字小文字の揺れがあっても許可判定できる", () => {
    vi.stubEnv("AUTH_SIGNUP_ALLOWED_EMAILS", "me@example.com");

    expect(isSignupEmailAllowed("Me@Example.com")).toBe(true);
  });

  it("ワイルドカード * は全アドレスを許可する（ローカル開発用）", () => {
    vi.stubEnv("AUTH_SIGNUP_ALLOWED_EMAILS", "*");

    expect(isSignupEmailAllowed("anyone@example.com")).toBe(true);
  });
});
