---
applyTo: "**/*.ts"
---

# TypeScript 規約

- strict モードを使用する（`tsconfig.json` で `astro/tsconfigs/strict` を extends）
- `@/*` エイリアスで `src/` 配下をインポートする
- 型推論が明確な場合は明示的な型注釈を省略してよい
- `any` 型の使用は禁止（型を明確にする）
- 未使用のインポートや変数を残さない
