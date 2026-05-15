---
name: ui-design-rules
description: kakeibo-share の UI/UX 規約。glassmorphism + indigo 基調 + lucide-react + recharts。新規コンポーネント作成、スタイル変更、カラー/角丸/シャドウの選択時に使用。
---

# UI/UX 規約

## デザインの方向性

**glassmorphism + ソフトシャドウ + 角丸大きめ + indigo 基調**のモダン UI。

## 共通クラス（最優先）

新規スタイルを書く前に、`src/app/globals.css` の `@layer components` にある共通クラスを使えないか検討:

- `.card-glass` — 半透明ガラス調カード（白90% + 角丸3xl + shadow-card）
- `.btn-primary` — indigo-600 のプライマリボタン
- `.btn-secondary` — slate のセカンダリボタン
- `.input-field` — テキスト入力フィールド

## カラーパレット

| 用途 | クラス |
|---|---|
| プライマリ | `bg-indigo-600` / `text-indigo-600` (ホバーは `-500`) |
| ニュートラル | `text-slate-{400,600,700,900}` / `border-slate-{100,200}` |
| 背景（ガラス） | `bg-white/90` + `backdrop-blur-sm` |
| エラー | `text-red-600` / `bg-red-50` |
| 成功 | `text-emerald-600` |

## 角丸

| 要素 | クラス | サイズ |
|---|---|---|
| 入力欄 / 小要素 | `rounded-2xl` | 16px |
| ボタン / カード | `rounded-3xl` | 24px |
| 大型ヒーロー | `rounded-4xl` | 32px |

`rounded-md` 以下は基本使わない。

## シャドウ（tailwind.config.ts の独自定義）

| クラス | 用途 |
|---|---|
| `shadow-ambient` | 控えめな全体浮かせ |
| `shadow-card` | カード基本 |
| `shadow-card-hover` | カードホバー |
| `shadow-dock` | 下からのドック型 |
| `shadow-hero` | ヒーローセクション |
| `shadow-hero-btn` | ヒーロー内ボタン |

## アイコン / チャート

- **アイコン**: `lucide-react` のみ使用。`<Heart className="w-5 h-5" />` のようにサイズは Tailwind で
- **チャート**: `recharts` のみ使用
- 新規ライブラリを安易に追加しない

## モーション

- ライブラリ: `framer-motion`
- アニメーション追加時は `prefers-reduced-motion: reduce` 対応を必ず入れる:

```tsx
const shouldReduce = useReducedMotion();
// motion 設定を分岐
```

- CSS keyframes を使う場合も `@media (prefers-reduced-motion: reduce)` で無効化（既存 `globals.css` に例あり）

## アクセシビリティ

- **`focus-visible:ring-2 focus-visible:ring-indigo-400`** を全インタラクティブ要素に
- 意味のあるアイコンには `aria-label`
- 装飾用アイコンには `aria-hidden="true"`
- カラーだけで意味を伝えない（テキストやアイコン併用）

## モバイルファースト

- 基本スタイルはモバイル想定（Tailwind デフォルト）
- デスクトップ拡張は `md:` (768px+) 以降
- 家計簿アプリは主にモバイルで使われる想定

## スタイル追加の手順

1. 共通クラス (`.card-glass` 等) で済むか確認
2. 単発なら Tailwind utility を JSX に直接
3. 何箇所も再利用するなら `@layer components` に追加
4. **inline `style={}` は最終手段**（動的計算が必要な場合のみ）

## 参照ドキュメント

UI 要件は `docs/requirements/UI/` を参照。

## やってはいけないこと

- `style={{ ... }}` を見た目調整に使う（動的値以外）
- カスタムカラーを増やす（indigo / slate / red / emerald で完結させる）
- `rounded-md` 以下の鋭い角丸
- `prefers-reduced-motion` 未対応のアニメーション

## トリガー語

- 「新しいコンポーネントを作って」
- 「ボタン / カード / 入力欄を追加して」
- 「スタイルを変更して」「色を変えて」
