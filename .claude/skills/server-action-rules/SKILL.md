---
name: server-action-rules
description: kakeibo-share の Server Action 規約。actions/ ディレクトリの実装、冪等性、エラー処理、revalidatePath / redirect の使い方。Server Action を書く前に使用。
---

# Server Action 規約

## 配置と命名

- 配置: `src/features/<domain>/actions/<name>-actions.ts`
- ファイル冒頭に `'use server'` ディレクティブ
- 関数名: `createExpense` / `updateExpense` / `deleteExpense` 等の動詞始まり

## 必須事項

### 1. 認証チェック

`createClient` で Supabase クライアントを取得し、`auth-repository` の `getSessionUser` で認証を確認:

```ts
import * as authRepo from "@/features/auth/lib/repositories/auth-repository";
import { createClient } from "@/server/supabase/server";

const supabase = await createClient();
const { data: { user } } = await authRepo.getSessionUser(supabase);
if (!user) return { ok: false, error: "UNAUTHORIZED" };
```

### 1b. DB アクセスは repository 経由

- Action 内で `supabase.from(...)` / `supabase.rpc(...)` を書かない
- バリデーション・複数テーブル・エラー変換が増える場合は `lib/services/` に切り出す（例: `profile-service.ts`）

### 2. 冪等性 (`client_request_id`)

書き込み系 Server Action は **`client_request_id`** を必ず受け取り、DB の `expenses.client_request_id` などのユニーク制約と組み合わせて重複登録を防ぐ。

- フォーム側で UUID を発行して送信
- Server Action 側でこの ID を INSERT 時に渡す
- 重複時はエラーではなく既存レコードを返す扱いにする

実装の参考: `src/features/expenses/actions/expense-actions.ts`

### 3. 戻り値の形式

`throw` ではなく **戻り値で結果を返す**:

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
```

`throw` するのは予期せぬ例外（DB 接続不能など）のみ。ユーザに見せるエラーは `ok: false` で返す。

### 4. revalidatePath

書き込み後、影響を受けるパスを明示的に `revalidatePath`:

```ts
import { revalidatePath } from "next/cache";
revalidatePath(`/groups/${groupId}`);
revalidatePath(`/groups/${groupId}/charts`);
```

### 5. redirect とタイムスタンプ

書き込み後にリダイレクトする場合、URL にタイムスタンプを付与してキャッシュを回避（白画面回避策）:

```ts
import { redirect } from "next/navigation";
redirect(`/groups/${groupId}?t=${Date.now()}`);
```

## エラー処理パターン

repository の戻り値は必ず `{ data, error }` を分解して error を先にチェック:

```ts
const { data, error } = await expenseRepo.insertExpense(supabase, row);
if (error) return { ok: false, error: error.message };
return { ok: true, data };
```

## auth 画面と他経路の同時更新

認証画面を `useActionState` + `AuthFormResult` にした場合:

- **同じ PR で** OAuth callback・middleware・招待 `next` など、リダイレクト/エラーを出す**すべての経路**を grep して更新する
- `redirect(?error=)` と `{ ok: false, formErrors }` を混在させない（例外: OAuth callback → UI が `?error=` を表示）
- 詳細は `.claude/skills/auth-flow-rules/` と `.cursor/rules/auth-change-verification.mdc` を参照

## やってはいけないこと

- Client Component から `fetch('/api/...')` で書き込み API を呼ぶ（Server Action 経由にする）
- `client_request_id` を受け取らない書き込み Action
- 戻り値で結果を返さず `throw` だけする実装
- 影響のあるパスを `revalidatePath` し忘れる
- Action に Supabase クエリを直書きする（repository / service を使う）

## トリガー語

- 「Server Action を作って」
- 「actions/ に新しい関数を追加して」
- 「DB に書き込む処理を追加して」
