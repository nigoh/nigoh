---
applyTo: "**/*.astro"
---

# Astro コンポーネント規約

- コンポーネントファイル名は PascalCase（例: `Header.astro`, `BaseLayout.astro`）
- Props は frontmatter 内で `interface Props` を定義し型安全にする
- `import.meta.env.BASE_URL` で base パスを取得し、リンクやアセットパスに使用する
- レイアウトは `<slot />` でコンテンツを受け取る
- Tailwind CSS のユーティリティクラスを使用する（インラインスタイル禁止）
- セマンティック HTML 要素を優先する（`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`）
- 新コンポーネント追加時は `specs/components/` に仕様を作成する
