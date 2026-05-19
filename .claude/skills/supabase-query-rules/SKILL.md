---
name: supabase-query-rules
description: Supabase クエリの配置・型安全・RLS 規約。DB アクセスコードを書く前、または既存のクエリを移動するときに使用。
---

# Supabase クエリ規約

## クエリの配置

| 用途 | 配置場所 | クライアント種別 |
|---|---|---|
| **Supabase 呼び出し本体** | `src/features/<domain>/lib/repositories/*.ts` | 第1引数 `SupabaseClient` |
| **バリデーション・オーケストーション** | `src/features/<domain>/lib/services/*.ts`（必要時） | repository 経由 |
| **エントリ（書き込み）** | `src/features/<domain>/actions/` または `src/app/api/**/route.ts` | `createClient` 取得後 repository 呼び出し |
| **読み取り（ページ表示）** | RSC → `lib/service.ts` → repository | `createClient` |
| **クライアント側の読み取り** | Client Component | `createBrowserClient`（読み取りのみ） |

**書き込みを Client Component から直接行わない**。必ず Server Action 経由にする。

**`actions/` と `app/api/**/route.ts` に `.from(` / `.rpc(` を直書きしない**。新規クエリは repository に追加する。

### repository 命名・引数

- 関数: `select*` / `insert*` / `update*` / `delete*` またはドメイン動詞（例: `acceptGroupInvite`）
- 第1引数は常に `SupabaseClient`
- 例外（レガシー）: `auth-repository` の `signUpWithEmail` / `signInWithPassword` / `signOut` は内部で `createClient` する

### 直書きの例外

- `src/server/supabase/middleware.ts` — セッション更新
- Client の OAuth 開始（例: `GoogleSignInButton`）— `auth.signInWithOAuth` のみ

## クライアントの作り方

- Server Component / Server Action: `createServerClient` (cookies 経由でセッション復元)
- Client Component: `createBrowserClient`
- 既存実装: `src/server/supabase/` 配下を参照

## 型安全

- Supabase の generated 型を使う（`Database` 型から推論）
- `as any` は禁止
- カラム指定 `.select("id, name")` の戻り値は型推論される

## エラーハンドリング

クエリは必ず `{ data, error }` を分解して error を先に処理:

```ts
const { data, error } = await supabase.from("groups").select("*").eq("id", groupId).single();
if (error) {
  // ログまたは return
  return { ok: false, error: error.message };
}
// ここから data は non-null
```

`.single()` でレコードが見つからない場合は `error` に値が入る（行が見つからないエラー）。

## RLS（Row Level Security）

- 全テーブルで RLS 有効化を前提とする
- アプリ側で「ユーザがこのレコードを見られるか」を `WHERE user_id = ?` で書かない
- 認可は DB レイヤ（RLS ポリシー）で行う
- アプリ側でのチェックは UX 改善目的のみ（早期 return など）

## やってはいけないこと

- 書き込み系を Client Component から実行
- `actions/` や Route Handler に `.from(` / `.rpc(` を直書きする
- `as any` で型を握り潰す
- error チェックなしで data をそのまま使う
- RLS 無効化したテーブルを作る

## トリガー語

- 「Supabase クエリを書いて」「DB から取得して」
- 「新しいテーブルにアクセスする処理を追加」
- 「型エラーが出るので as any で回避したい」
