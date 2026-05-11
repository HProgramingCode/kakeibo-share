/**
 * OAuth・メールログイン後の next クエリ用。オープンリダイレクトを防ぐ。
 */
export function safeAuthRedirectPath(
  next: string | null | undefined,
  fallback = "/groups",
): string {
  if (next == null || typeof next !== "string") {
    return fallback;
  }
  const trimmed = next.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }
  if (trimmed.includes("://")) {
    return fallback;
  }
  if (
    trimmed.startsWith("/auth/callback") ||
    trimmed.startsWith("/api/auth/callback")
  ) {
    return fallback;
  }
  return trimmed;
}
