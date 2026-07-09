# CLAUDE.md

H.Nigo の個人サイト（自己紹介・履歴・スキル）。1 ページ完結の静的サイト。

## コマンド

```sh
npm run dev       # 開発サーバ
npm run build     # 本番ビルド（dist/）
npm run preview   # ビルド成果のプレビュー
npx astro check   # 型・診断チェック（CI ゲート相当）
```

## スタック

- Astro 5（SSG） / Tailwind CSS 3 / TypeScript strict / React island（`@astrojs/react`）
- 装飾: Tiled + Phaser（構成主義タイル）。`@react-spring/web` も一部で使用
- デプロイ: GitHub Pages `https://nigoh.github.io/nigoh/`（`base: /nigoh/`）

## ディレクトリ

```
src/components/        Astro / React コンポーネント
src/components/phaser/ Phaser 装飾（game/scene/agent/grid/tiles/sections）
src/layouts/ src/pages/ src/styles/
public/                静的・public/tilemaps/ は Tiled 出力（生成物）
assets/tiled/          Tiled ソース（ビルド非対象）
specs/                 SDD 仕様書
```

## デザイン言語（ロシア構成主義 / エル・リシツキー）

- パレット（`tailwind.config.mjs` の `constructivist.*` が**唯一の出典**。色を勝手に増やさない）
  - red `#D62828` / black `#1A1A1A` / cream `#F5F0EB` / gray `#8B8680` / darkgray `#3D3A37`
- フォント: Bebas Neue（見出し）/ Inter・Noto Sans JP（本文）/ JetBrains Mono（数値）
- 原則: 幾何学的・アシンメトリック・シャープエッジ（角丸なし）・ボールドタイポ・大文字
- 装飾は純装飾（`aria-hidden`）。詳細は `specs/components/decoration.spec.md`

## SDD ワークフロー

実装の前に `specs/**` の該当仕様を確認・更新し、実装後に受入条件（`- [ ]`）を検証する。
テンプレートは `specs/README.md`。

## エージェント分担（`.claude/agents/`）

- **designer** — 視覚設計・トークン・構図・視覚 a11y を**決める**。出力は spec とプロトタイプ。
- **frontend** — 仕様を Astro/React/TS で**実装・最適化・検証**する。
- 受け渡し: designer の spec/トークン → frontend が実装 → `frontend-verify` で検証。
- 視覚レビューは `design-review` skill、実装検証は `frontend-verify` skill を使う。

## 規約

- ファイル種別ごとの詳細規約は `.github/instructions/*.instructions.md`（Astro/TS/CSS/specs）に従う。
- TypeScript: `any` 禁止、未使用 import/変数を残さない。`import.meta.env.BASE_URL` で base 参照。
- Astro: Props は `interface Props`、セマンティック HTML、Tailwind ユーティリティ優先。
- コメント・仕様書は日本語、コミットメッセージは英語。
- 掲載コンテンツ（職務経歴）: 業務案件の具体的な機器名・製品名（例: 改札機）・クライアント名・
  案件番号は書かない。「社会インフラ機器」「専用端末」のような一般化した表現に置き換える。
- Portfolio: GitHub の公開リポジトリからビルド時に自動生成する。faj / do_hug 系の業務関連
  リポジトリは掲載しない（`src/pages/index.astro` の除外パターン `excludedRepos` を維持・更新する）。
- エージェントは **push しない**（コミットまでは可、push は人間/メインが担当）。
  hook は force-push と master への直 push を遮断する（PreToolUse はメイン/サブを区別できないため、
  全面禁止ではなく「危険な push」に限定）。
- 生成物（`dist/` `.astro/` `public/tilemaps/*.json`）は直接編集しない（hook がブロック）。
