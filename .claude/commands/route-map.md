---
description: App Router のルート構造をツリー表示
---

# /route-map

`src/app/` を再帰走査し、ルーティング構造をツリー形式で表示する。

## 手順

1. `src/app/` 配下を find で走査:
   ```bash
   find src/app -type f \( -name "page.tsx" -o -name "route.ts" -o -name "layout.tsx" -o -name "loading.tsx" -o -name "error.tsx" -o -name "not-found.tsx" \) | sort
   ```

2. パスから URL を導出:
   - `src/app/page.tsx` → `/`
   - `src/app/login/page.tsx` → `/login`
   - `src/app/groups/[id]/page.tsx` → `/groups/[id]`
   - `(group)` で囲まれた Route Group は URL に出ない
   - `src/app/api/expenses/route.ts` → `/api/expenses` (API)

3. 出力形式（ツリー + 対応表）:
   ```
   ## ルートツリー
   /
   ├── login/
   │   ├── page.tsx
   │   └── loading.tsx
   ├── signup/page.tsx
   ├── groups/
   │   └── [id]/
   │       └── page.tsx
   └── api/
       └── expenses/route.ts

   ## URL 対応表
   | URL | 種別 | ファイル |
   |---|---|---|
   | /         | page  | src/app/page.tsx |
   | /login    | page  | src/app/login/page.tsx |
   | /groups/[id] | page | src/app/groups/[id]/page.tsx |
   | /api/expenses | api | src/app/api/expenses/route.ts |
   ```

4. 各ルートの `layout.tsx` / `loading.tsx` / `error.tsx` の有無を補足:
   - `[+layout]` / `[+loading]` / `[+error]` を URL の右に付ける

## 注意

- ファイルを変更しない（表示のみ）
- 大量のルートがある場合は `src/app/` 直下から段階的に展開
