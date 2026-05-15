---
description: 'use client' 使用箇所の妥当性を一覧化してレビュー
---

# /rsc-check

`src/` 配下の `'use client'` ファイルを抽出し、本当に Client Component である必要があるかを判定する。

## 手順

1. `'use client'` を含むファイルを grep:
   ```bash
   grep -rln "^['\"]use client['\"]" src --include="*.tsx" --include="*.ts"
   ```

2. 各ファイルについて先頭 100 行を Read し、以下を抽出:
   - 使用している React フック（`useState` / `useEffect` / `useRef` / `useContext` 等）
   - イベントハンドラの有無（`onClick` / `onChange` / `onSubmit` 等）
   - ブラウザ専用 API（`window` / `localStorage` / `navigator`）
   - クライアント専用ライブラリ（`framer-motion` の `motion.*`, `recharts` 等）

3. 判定:
   - 上記いずれかを使っていれば ✅ 妥当
   - 何も使っていなければ ⚠️ Server Component に降格可能

4. 出力形式:
   ```
   | ファイル | フック | ハンドラ | ブラウザAPI | クライアントlib | 判定 |
   |---|---|---|---|---|---|
   | features/.../X.tsx | useState | onClick | - | - | ✅ |
   | features/.../Y.tsx | - | - | - | - | ⚠️ 降格可能 |
   ```

5. ⚠️ があれば、降格の手順を補足:
   - 親 RSC で必要なデータを取得
   - `'use client'` を削除
   - 動かなくなったらインタラクティブ部分を切り出し

## 注意

- ファイルを変更しない（レビューのみ）
- 詳細は `.claude/skills/nextjs-rsc-rules/` を参照
