import { describe, expect, it } from "vitest";

import { loginSchema, signupSchema } from "./auth";

describe("loginSchema", () => {
  it("正しいメールアドレスとパスワードを受け入れる", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
  });

  it("メールアドレスが空のとき失敗する", () => {
    const result = loginSchema.safeParse({ email: "", password: "password123" });

    expect(result.success).toBe(false);
  });

  it("メールアドレスの形式が不正なとき失敗する", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });

    expect(result.success).toBe(false);
  });

  it("パスワードが7文字のとき失敗する（境界値）", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "1234567",
    });

    expect(result.success).toBe(false);
  });

  it("パスワードが8文字のとき成功する（境界値）", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "12345678",
    });

    expect(result.success).toBe(true);
  });
});

describe("signupSchema", () => {
  it("名前・メール・パスワードが揃っていれば成功する", () => {
    const result = signupSchema.safeParse({
      name: "kazuki",
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
  });

  it("名前が空のとき失敗する", () => {
    const result = signupSchema.safeParse({
      name: "",
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(false);
  });

  it("名前が51文字のとき失敗する（境界値）", () => {
    const result = signupSchema.safeParse({
      name: "a".repeat(51),
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(false);
  });
});
