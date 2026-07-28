import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 認証状態に応じたリダイレクト。
 *
 * Next.js 16 では middleware.ts が proxy.ts に改名されている（conventions.md §1）。
 *
 * ここで見ているのは Cookie の有無だけで、セッションの検証はしていない。
 * Cookie を偽装すれば通過できるため、**これは認可ではなく UX 上の振り分け**。
 * 実際の保護は各ページ / Server Function 側の `auth.api.getSession()` で行う。
 */

/** 未ログインでも見られるパス。ログイン済みで訪れた場合はワードローブへ送る */
const PUBLIC_PATHS = ["/", "/login", "/signup"];

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const hasSession = getSessionCookie(request) !== null;
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (!hasSession && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (hasSession && isPublic) {
    return NextResponse.redirect(new URL("/wardrobe", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // 静的ファイル・画像・API は対象外にする
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
