# kakeibo-share（みんなの精算）

家族向けの立替・精算 Web アプリ（MVP 開発中）。

仕様・設計ドキュメントはリポジトリに含めず、手元の `docs/` で管理しています（`.gitignore`）。

## 前提

- Node.js 20+
- npm（またはお好みのパッケージマネージャ）
- Supabase プロジェクト（新規作成でも可）

## セットアップ

```bash
npm install
cp .env.local.example .env.local
# .env.local に Supabase の URL / anon key を設定
```

データベースは Supabase CLI で `supabase link` のうえ `npx supabase db push` でマイグレーションを適用します（手順の詳細は手元の `docs/engineering/supabase-setup.md` があれば参照）。

開発サーバー:

```bash
npm run dev
```

## ディレクトリ

| パス | 内容 |
|------|------|
| `src/app` | Next.js App Router。各 `page.tsx` がデータ取得・エラー分岐・画面の組み立てを担当します。 |
| `src/app/**/_components` | そのルートだけで使う画面部品。`_` 始まりのためURLにはなりません。 |
| `src/app/**/_lib` | そのルートだけで使う表示用の型・整形・フィルター。 |
| `src/features/<domain>/actions` | Server Action。入力検証、再検証、リダイレクトを担当します。 |
| `src/features/<domain>/repositories` | Supabase の `.from()` / `.rpc()` を集約します。 |
| `src/features/<domain>/model` | ドメインの型、計算、入力解析、バリデーションを置きます。 |
| `src/features/<domain>/components` | 複数ルートから再利用するドメイン部品です。 |
| `src/features/<domain>/server` | 認証・メンバーシップ確認などサーバー専用の補助処理です。 |
| `src/shared` | ナビゲーション、整形、汎用UI・hookなどドメイン非依存の共通基盤です。 |
| `supabase/migrations` | SQL マイグレーション |

## メモ

- 参考用の `sample/` はリポジトリに含めません（手元で管理する場合のみ）。
- メール確認をオフにするとローカルでのサインアップ検証が楽です（Supabase Dashboard → Authentication）。
