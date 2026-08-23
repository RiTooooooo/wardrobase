import "dotenv/config";

import { createInterface } from "node:readline";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

/**
 * アカウントを公開エンドポイント経由ではなく、運用者の手元から直接作成するスクリプト。
 *
 * 本番の新規登録（AUTH_ALLOW_SIGNUP）は常時封鎖のままにできるため、
 * 「一時開放中に第三者が先回りして登録する」経路そのものを無くせる。
 * パスワードは better-auth の正規のハッシュ処理を通り、平文では保存されない。
 *
 * 使い方（ローカルDB: .env の DATABASE_URL を使う）:
 *   npm run user:create
 *
 * 本番DB: 接続文字列はシェル履歴に残さないよう、Git管理外のファイルに置いて渡す:
 *   1. .env.production.local に DATABASE_URL=<本番の接続文字列> を書く（gitignore済み）
 *   2. DOTENV_CONFIG_PATH=.env.production.local npm run user:create
 *
 * メールアドレス・パスワードは実行後に対話式で聞かれる
 * （シェル履歴やプロセス一覧に残さないため、コマンドラインでは渡さない設計。
 * パスワードは入力中も画面に表示されない）。
 * 実行前に作成先DBホストを表示し、yes の入力を求める。
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (value === undefined || value === "") {
    throw new Error(`${key} が設定されていません。`);
  }
  return value;
}

type Prompter = {
  ask: (prompt: string, hidden: boolean) => Promise<string>;
  close: () => void;
};

/** 全質問で1つの readline を使い回す（質問ごとに作り直すと2問目以降が読めない） */
function createPrompter(): Prompter {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });
  const rlHook = rl as unknown as { _writeToOutput: (text: string) => void };
  const writeToOutput = rlHook._writeToOutput.bind(rl);
  let hidden = false;

  // hidden 中は入力エコーを止める readline の内部フック。パスワードを画面に出さない
  rlHook._writeToOutput = (text: string): void => {
    if (!hidden) writeToOutput(text);
  };

  // 入力行はキューに貯めて順に消費する（パイプ入力で複数行が一度に届いても取りこぼさない）
  const buffered: string[] = [];
  let waiting: ((line: string) => void) | null = null;
  let closed = false;

  rl.on("line", (line) => {
    if (waiting === null) {
      buffered.push(line);
      return;
    }
    const deliver = waiting;
    waiting = null;
    deliver(line);
  });

  rl.on("close", () => {
    closed = true;
    if (waiting === null) return;
    const deliver = waiting;
    waiting = null;
    deliver("");
  });

  function ask(prompt: string, hideInput: boolean): Promise<string> {
    hidden = hideInput;
    process.stdout.write(prompt);

    return new Promise((resolve) => {
      function deliver(line: string): void {
        hidden = false;
        if (hideInput) process.stdout.write("\n");
        resolve(line.trim());
      }

      const line = buffered.shift();
      if (line !== undefined) {
        deliver(line);
        return;
      }
      if (closed) {
        deliver("");
        return;
      }
      waiting = deliver;
    });
  }

  return {
    ask,
    close: (): void => {
      rl.close();
    },
  };
}

async function main(): Promise<void> {
  const databaseUrl = requireEnv("DATABASE_URL");
  const dbHost = new URL(databaseUrl).hostname;

  console.log(`作成先DB: ${dbHost}`);

  const prompter = createPrompter();
  const email = await prompter.ask("メールアドレス: ", false);
  const fallbackName = email.split("@")[0];
  const name =
    (await prompter.ask(`表示名（空なら ${fallbackName}）: `, false)) ||
    fallbackName;
  const password = await prompter.ask(
    "パスワード（画面に表示されません）: ",
    true,
  );

  if (password.length < 8) {
    prompter.close();
    throw new Error("パスワードは8文字以上にしてください。");
  }

  const confirm = await prompter.ask(
    `${dbHost} に ${email} を作成します。よろしければ yes と入力: `,
    false,
  );
  prompter.close();

  if (confirm !== "yes") {
    console.log("中止しました。");
    return;
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  // スクリプト専用の better-auth インスタンス。
  // アプリ本体（src/lib/auth.ts）と違い公開されないため、サインアップを常に有効にしてよい
  const auth = betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
  });

  try {
    await auth.api.signUpEmail({ body: { name, email, password } });
    console.log("アカウントを作成しました。");
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
