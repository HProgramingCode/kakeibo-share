# kakeibo-share — Claude 向けプロジェクトルール

## 技術スタック

- Next.js 15 (App Router) / React 19 / TypeScript 5.8
- Supabase (auth + DB) / Tailwind 3 / Vitest
- パッケージマネージャ: npm

## 大原則

1. **RSC 優先**: Server Component をデフォルト、`'use client'` は最小スコープに限定
2. **Server Action 経由**: DB 書き込みは Server Action から。Client から直接 Supabase 書き込み禁止
3. **features/ 構成**: `src/features/<domain>/` 配下に `actions / lib / ui / screens` を分離
4. **型を明示**: `any` 禁止。Supabase の型は generated を使う
5. **テストは Vitest**: Jest API (`jest.fn()` 等) は混入させない
6. **UI/UX 規約**:
   - 共通クラス優先: `.card-glass` / `.btn-primary` / `.btn-secondary` / `.input-field` (`src/app/globals.css`)
   - カラー: primary=`indigo-600` / neutral=`slate` / 背景=`white/90` (glassmorphism)
   - 角丸は `rounded-2xl` 以上を基本
   - アイコンは `lucide-react`、チャートは `recharts` で統一
   - アクセシビリティ: `focus-visible:ring` 必須、`prefers-reduced-motion` 配慮
   - 新規スタイルは inline ではなく Tailwind utility か `@layer components` 経由

## 詳細ルールの所在

個別の判断は以下の Skill を参照（必要時のみロード）:

- `.claude/skills/nextjs-rsc-rules/` — RSC vs Client の判断基準
- `.claude/skills/server-action-rules/` — Server Action 規約（冪等性・エラー）
- `.claude/skills/supabase-query-rules/` — クエリ配置と RLS
- `.claude/skills/ui-design-rules/` — UI/UX 規約の詳細

## 補助コマンド

- `/initdev` — 環境セットアップ・差分更新
- `/rsc-check` — `'use client'` 使用箇所の妥当性レビュー
- `/route-map` — App Router のルート構造を表示
- `/run-checks` — lint + typecheck + build を一括実行

## やってほしくないこと

- CLAUDE.md / Skill にコード片を貼り込まない（コードは `src/` を真実とする）
- 既存メモリ (`~/.claude/projects/.../memory/`) の上書き
- `--no-verify`、`git reset --hard` 等の破壊的操作（明示許可なしで）
