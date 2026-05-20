---
name: nextjs-rsc-rules
description: Next.js App Router の RSC (Server Component) と Client Component の判断基準。'use client' を書く前、新規コンポーネント追加時、または既存の境界を見直すときに使用。
---

# RSC / Client Component 判断ルール

## 大原則

**デフォルトは Server Component**。`'use client'` を書かない。

## `'use client'` が必要な条件

以下のいずれかに該当する場合のみ Client Component にする:

- `useState` / `useEffect` / `useReducer` / `useRef` 等の React フックを使う
- イベントハンドラ (`onClick`, `onChange`, `onSubmit` 等) を JSX に直接書く
- ブラウザ専用 API (`window`, `localStorage`, `navigator` 等) を使う
- React Context の Provider/Consumer を使う
- `framer-motion` / `recharts` などクライアント側で動くライブラリのコンポーネントを内部で使う

## 境界の引き方

- **Client Component は葉に置く**: なるべく小さく、UI の末端で `'use client'` を付ける
- **データフェッチは親 RSC で完結**: Client コンポーネントには取得済みのデータを props で渡す
- **大きなページ全体を Client にしない**: インタラクティブな小要素だけ切り出す

## データの渡し方 (Server → Client)

Server Component から Client Component に渡す props は **シリアライズ可能な型のみ**:

- ✅ プリミティブ（string / number / boolean / null）
- ✅ プレーンオブジェクト / 配列
- ✅ `Record<string, T>`（ID 引き map など）
- ❌ `Map` / `Set` — シリアライズできない
- ❌ 関数（Server Action は例外）
- ❌ クラスインスタンス / Date オブジェクトはプリミティブに変換

## 配置パターン

```
src/features/<domain>/
├── screens/<name>-screen.tsx       ← Server Component（データフェッチ）
└── ui/
    ├── <SomeStatic>.tsx            ← Server Component（静的表示）
    └── <SomeInteractive>.tsx       ← Client Component（'use client'）
```

## チェック手順

新規コンポーネント or `'use client'` 追加時の確認:

1. このコンポーネントで React フック / イベントハンドラ / ブラウザ API を使うか？ → No なら Server のまま
2. もし使うなら、その「インタラクティブな部分だけ」を別ファイルに切り出せないか？
3. 切り出した結果、データフェッチは親 RSC に残せるか？

## 既存事例

実装の参考は `src/features/groups/group-detail/` 配下を参照（RSC と Client の分離例）。

## トリガー語

- 「`'use client'` を追加して」「Client Component にして」
- 「インタラクティブな UI を作って」
- 「コンポーネントが多すぎる場合の整理」
