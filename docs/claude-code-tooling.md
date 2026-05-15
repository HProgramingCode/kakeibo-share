# Claude Code 開発環境ツール一覧

このプロジェクトで使用している Claude Code の MCP / Plugin / Skill の構成と運用メモ。

## 役割の違い

| 種別 | 何か | 起動方法 |
|---|---|---|
| **MCP Server** | 外部ツール（ブラウザ、DB、API 等）を Claude が呼べる橋渡し | プロジェクト/グローバル設定で定義 |
| **Plugin** | Skill・コマンド・フック・MCP・エージェントなどをまとめた配布パッケージ | `settings.json` の `enabledPlugins` |
| **Skill** | 「こういう時はこう動け」という手順書（Markdown） | Claude が自動選択、または `/name` で明示起動 |

## 現在の構成

### MCP Server

| サーバ名 | 用途 | 定義場所 |
|---|---|---|
| `playwright` | ブラウザ自動操作（E2E、UI 検証） | `.mcp.json`（プロジェクト）、`.claude/settings.local.json` で有効化 |

### Plugin

| プラグイン | 用途 | 配布元 |
|---|---|---|
| `superpowers@superpowers-marketplace` | brainstorming / TDD / debugging / writing-skills など17個のメタスキル集 | `obra/superpowers-marketplace`（GitHub） |
| `company@cc-company` | 仮想組織エージェント（秘書・部署） | `cc-company` マーケットプレイス |
| `claude-mem@thedotmack` | セッション横断メモリ（SQLite 永続化、検索可能） | `thedotmack/claude-mem`（GitHub） |

定義場所: `~/.claude/settings.json`（ユーザー設定）

### Skill

| カテゴリ | 配置 | 例 |
|---|---|---|
| 個人スキル | `~/.claude/skills/` | `efficient-codework`（トークン効率重視のコード作業ルール） |
| プラグイン経由 | `~/.claude/plugins/cache/.../skills/` | `superpowers:brainstorming`, `claude-mem:do`, `company:company` |
| Anthropic 純正 | 組み込み / 公式マーケット | `update-config`, `init`, `review`, `security-review`（公式マーケットには `frontend-design` 等あり、未導入） |

### プロジェクトローカル（kakeibo-share 専用）

`/initdev` で整備したプロジェクト配下の Skill と補助コマンド:

| 種別 | パス | 用途 |
|---|---|---|
| Skill | `.claude/skills/nextjs-rsc-rules/` | RSC / Client 判断 |
| Skill | `.claude/skills/server-action-rules/` | Server Action 規約 |
| Skill | `.claude/skills/supabase-query-rules/` | Supabase クエリ規約 |
| Skill | `.claude/skills/ui-design-rules/` | UI/UX 規約 |
| Command | `.claude/commands/initdev.md` | 環境セットアップ・差分更新 |
| Command | `.claude/commands/rsc-check.md` | 'use client' 妥当性レビュー |
| Command | `.claude/commands/route-map.md` | App Router ツリー表示 |
| Command | `.claude/commands/run-checks.md` | lint + typecheck (+ build) 一括実行 |
| 設定 | `.claude/settings.json` | チーム共有 permission |
| ルール | `CLAUDE.md`（プロジェクトルート） | プロジェクトルール本体 |

## 使い方

### MCP

- 普段は意識不要。該当作業（E2E テスト等）で Claude が自動呼び出し
- 接続状態確認: `/mcp`
- 追加: `claude mcp add` または `.mcp.json` 編集

### Plugin

- 起動時に自動ロード
- 管理 UI: `/plugin`（インストール / 有効化 / 無効化）
- 無効化: `~/.claude/settings.json` の `enabledPlugins` で該当プラグインを `false`

### Skill

- **自動発火**: 「ブレストしたい」「TDD で実装して」など意図が合致すると Claude が呼ぶ
- **明示起動**: `/skill-name`（例: `/brainstorming`, `/efficient-codework`）
- **無効化**: `~/.claude/settings.json` に `skillOverrides` を追加（`off` / `name-only` / `user-invocable-only`）
- **listing 圧縮**: `skillListingMaxDescChars` で description 長を絞れる

## 関連設定ファイル

| パス | 役割 | git |
|---|---|---|
| `~/.claude/settings.json` | グローバル設定（model、hooks、plugins、status line） | コミット対象外 |
| `.claude/settings.json` | プロジェクト共有設定（チーム共通の hook / permission） | コミット可（現状未作成） |
| `.claude/settings.local.json` | プロジェクト個人設定（permission など） | **gitignore 推奨** |
| `.mcp.json` | プロジェクト用 MCP サーバ定義 | コミット可 |
| `~/.claude/skills/<name>/SKILL.md` | 個人スキル | コミット対象外 |
| `~/.claude/projects/<sanitized-cwd>/memory/` | auto-memory（会話横断の構造化メモ） | コミット対象外 |

## 運用上の注意

### claude-mem と MEMORY.md は別物

| | 用途 | 管理 |
|---|---|---|
| `MEMORY.md`（auto-memory） | Claude が書く構造化メモ（user / feedback / project / reference） | Claude が読み書き |
| `claude-mem` | 会話の自動観測ログを SQLite に蓄積、`mcp__plugin_claude-mem_*` で検索 | フックで自動取得 |

両方併用可。`claude-mem` は Bun ランタイム必須（`~/.bun/bin/bun`、PATH は `~/.zshenv` 経由）。

### 確認しておくと良い項目

| 項目 | コマンド/手段 |
|---|---|
| MCP 接続状態 | `/mcp` |
| 有効スキル一覧 | セッション開始時のシステムメッセージ |
| プラグイン管理 | `/plugin` |
| Bun が PATH に乗っているか | `bun --version` |

### `.claude/` の取り扱い

- `settings.local.json` は個人 token / 個人 permission を含む可能性 → 個人開発でも基本 gitignore 推奨
- `settings.json`（共有用）を作るなら hook・MCP 許可・チームで揃えたい permission のみ
