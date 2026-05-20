---
description: kakeibo-share の Claude Code 開発環境セットアップ・差分更新
---

# /initdev

プロジェクトの Claude Code 設定（CLAUDE.md / Skill / 補助コマンド / settings.json）を診断し、不足分の追加・更新を提案する。冪等。

## 全体フロー

```
Step 1: 現状診断  →  Step 2: 差分計算  →  Step 3: 計画提示
                                                ↓
                                        ユーザ承認待ち
                                                ↓
Step 5: サマリ表示  ←  Step 4: 一括適用
```

## Step 1: 現状診断

以下を **存在チェックのみ**（中身は基本読まない）で確認:

### ファイル存在チェック

- `CLAUDE.md`
- `.claude/settings.json`
- `.claude/commands/{initdev,rsc-check,route-map,run-checks}.md`
- `.claude/skills/{nextjs-rsc-rules,server-action-rules,supabase-query-rules,ui-design-rules}/SKILL.md`

各ファイルについて Bash の `[ -f path ] && echo exists || echo missing` で判定。

### 環境チェック

| 項目 | コマンド | 判定 |
|---|---|---|
| Node バージョン | `node --version` | `>= v18.18` か |
| Bun の PATH | `which bun \|\| echo none` | あれば OK |
| Supabase CLI | `which supabase \|\| echo none` | 任意 |
| 有効プラグイン | `cat ~/.claude/plugins/installed_plugins.json` | `typescript-lsp` / `claude-md-management` の有無 |
| context7 MCP | `cat ~/.claude/settings.json` を読み `enabledMcpjsonServers` か関連設定を確認 | 任意 |

## Step 2: 差分計算

`.claude/commands/initdev.md` を読んでいる時点で initdev は存在。それ以外の不足ファイル一覧を作成。

不足カテゴリ:
- **必須ファイル不足**: CLAUDE.md, settings.json, commands, skills のうち欠けているもの
- **推奨プラグイン未導入**: typescript-lsp, claude-md-management
- **推奨 CLI 未導入**: supabase

## Step 3: 計画提示

ユーザに以下を表示し、`yes / no` で承認を取る:

```
## /initdev 実行プラン

### 新規作成
| パス | 内容 |
|---|---|
| CLAUDE.md | プロジェクトルール本体 |
| .claude/settings.json | チーム共有 permission |
| ... |

### 更新
（既に揃っているファイルはここに出ない）

### 環境（自動変更しない、案内のみ）
| 項目 | 状態 | 推奨アクション |
|---|---|---|
| typescript-lsp | 未導入 | /plugin install typescript-lsp@claude-plugins-official |
| supabase CLI | 未導入 | brew install supabase/tap/supabase |

進めますか？ (yes / no)
```

**重要**: 既に存在するファイルは**自動更新しない**。差分がある場合のみ「内容に差異があります」と表示し、個別承認を求める。

## Step 4: 一括適用（yes の場合）

不足ファイルのみを Write で作成する。各ファイルの内容は **このリポジトリのテンプレ**（下記）を使用。

### テンプレート参照

各ファイルの内容は以下を参照（テンプレ本体はこのコマンドファイルが直接持つのではなく、Implementation Plan の Task 1〜9 を参照する形で再生成）:

- CLAUDE.md: `docs/superpowers/plans/2026-05-15-initdev.md` の Task 2
- settings.json: 同 Task 1
- nextjs-rsc-rules: 同 Task 3
- server-action-rules: 同 Task 4
- supabase-query-rules: 同 Task 5
- ui-design-rules: 同 Task 6
- rsc-check: 同 Task 7
- route-map: 同 Task 8
- run-checks: 同 Task 9

**実装メモ**: Claude は plan ファイルを Read してテンプレ抽出 → Write で復元する。

### 既存ファイル取り扱い

- 個人メモリ (`~/.claude/projects/.../memory/`) には **触らない**
- `.claude/settings.local.json` には **触らない**
- 既存の `CLAUDE.md` がある場合は diff を表示し、ユーザ判断で追記 or 上書き

## Step 5: サマリ表示

```
## /initdev 完了

### 作成済み
- ✅ CLAUDE.md
- ✅ .claude/settings.json
- ...

### スキップ（既に最新）
- .claude/skills/nextjs-rsc-rules/SKILL.md

### 次のアクション
- /plugin install typescript-lsp@claude-plugins-official で型チェック効率化
- /plugin install claude-md-management@claude-plugins-official で CLAUDE.md 整備支援
- brew install supabase/tap/supabase で型再生成可能に

設定完了。新規セッションで CLAUDE.md と Skill が自動読み込みされます。
```

## 注意事項

- **トークン節約**: ファイル中身の Read は「内容更新が必要なファイル」のみ
- **冪等性**: 全てのファイルが揃っている場合は「すべて最新です」で終了
- **破壊的操作禁止**: 既存ファイル上書き時は必ずユーザに確認
- **プラグイン自動インストール禁止**: `/plugin install` は案内のみ
