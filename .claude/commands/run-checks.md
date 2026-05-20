---
description: lint + typecheck (+ build) を順次実行し、結果を要約
---

# /run-checks

ローカルで品質チェックを順次走らせ、失敗箇所だけを要約する。引数が `--with-build` の場合のみ build も実行する。

## 手順

引数 `$ARGUMENTS` を確認:
- 空 or `--no-build`: lint + typecheck のみ
- `--with-build`: lint + typecheck + build

### Step 1: lint

```bash
npm run lint 2>&1 | tail -50
```

結果を判定:
- exit 0 → ✅ lint pass
- exit !0 → ❌ 失敗ファイル / ルール名 / 行番号 / メッセージを最大 10 件抽出

### Step 2: typecheck

```bash
npx tsc --noEmit 2>&1 | tail -50
```

結果を判定:
- 0 errors → ✅ typecheck pass
- N errors → ❌ ファイル:行 / メッセージを最大 10 件抽出

### Step 3: build（`--with-build` のときのみ）

```bash
npm run build 2>&1 | tail -100
```

結果を判定:
- 成功 → ✅ build pass + 出力サイズの最終行（Route ごとのサイズ）を表示
- 失敗 → ❌ エラーメッセージの先頭 20 行

## 出力フォーマット

```
## /run-checks 結果

| ステップ | 結果 | エラー件数 |
|---|---|---|
| lint      | ✅ | 0 |
| typecheck | ❌ | 3 |
| build     | -  | (--with-build 未指定) |

### typecheck エラー一覧
- src/features/expenses/actions/expense-actions.ts:42 - Type 'string' is not assignable to type 'number'
- src/features/groups/.../service.ts:88 - Property 'foo' does not exist
- ...
```

## 注意

- フル出力はトークン消費が大きいため、`tail -50` で末尾のみ取得
- ユーザが「フルログを見たい」と要求した場合のみ、`tail` を外して再実行
