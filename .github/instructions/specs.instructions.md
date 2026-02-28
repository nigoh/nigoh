---
applyTo: "specs/**"
---

# SDD 仕様書の書き方

- `specs/README.md` のテンプレートに従う
- 各仕様ファイルは「目的・入力・出力・デザイン指針・受入条件」のセクションを持つ
- 受入条件はチェックボックス形式（`- [ ]`）で記述する
- ファイル名は小文字 kebab-case + `.spec.md`（例: `header.spec.md`）
- コンポーネント仕様は `specs/components/` に、ページ仕様は `specs/pages/` に配置する
- 実装前に仕様を書き、実装後に受入条件を検証する
