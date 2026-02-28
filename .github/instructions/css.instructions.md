---
applyTo: "**/*.css"
---

# CSS / Tailwind 規約

- Tailwind CSS のユーティリティクラスを使用し、カスタム CSS は最小限にする
- `global.css` には Tailwind ディレクティブ（`@tailwind base/components/utilities`）とフォントのインポートのみ記述する
- カスタムクラスが必要な場合は `@apply` ディレクティブを使用する
- カラーは Tailwind のカラーパレットを使用する（テーマカラー: `emerald`）
- レスポンシブはモバイルファーストで `sm:`, `md:`, `lg:` プレフィックスを使用する
