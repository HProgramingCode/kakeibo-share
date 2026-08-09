import { ROUTES } from "@/shared/navigation/routes";

/** 認証画面間リンク用。next がデフォルトのときは path のみ返す。 */
export function authPathWithNext(path: string, next: string): string {
  if (next === ROUTES.groups) {
    return path;
  }
  return `${path}?next=${encodeURIComponent(next)}`;
}

/** 既にクエリがある path に next を付与（エラー URL 等） */
export function appendNextQuery(pathWithQuery: string, next: string): string {
  if (next === ROUTES.groups) {
    return pathWithQuery;
  }
  const separator = pathWithQuery.includes("?") ? "&" : "?";
  return `${pathWithQuery}${separator}next=${encodeURIComponent(next)}`;
}
