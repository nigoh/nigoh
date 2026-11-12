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

- Astro 5（SSG） / Tailwind CSS 3 / TypeScript strict（`@astrojs/react` は設定に残るが、今の画面は React island を使わない）
- 装飾: SVG と CSS だけ（ケーブル・プラグ・コンセント・点の方眼）。外部の描画ライブラリは使わない
- デプロイ: GitHub Pages `https://nigoh.github.io/nigoh/`（`base: /nigoh/`）

## ディレクトリ

```
src/components/        Astro コンポーネント（Logo・Icon・Header・FlowRail・FlowNode・CareerGantt・Footer）
src/layouts/ src/pages/ src/styles/
public/                静的・public/tilemaps/ は Tiled 出力（生成物）
assets/tiled/          Tiled ソース（ビルド非対象）
specs/                 SDD 仕様書
```

## デザイン言語（pipe-in の「プラグ」 / 作業台）

2026-11 にバウハウス → **pipe-in の「プラグ」**へ刷新（`specs/plug-2026.spec.md`。出典は `nigoh/pipe-in` の `docs/design/README.md`）。
- パレット（`tailwind.config.mjs` の `plug.light` / `plug.dark` が**唯一の出典**。ここ以外で色を足さない）
  - 役の名前で呼ぶ: bg / canvas / panel / col / line / edge / fg / muted / coral(-tint/-ink, on-coral) / teal(-tint/-ink) / ok(-tint/-ink) / logo-teal / logo-coral
  - CSS は `--c-*`（`global.css` が `theme()` で作る）、Tailwind は `ui-*`（`bg-ui-panel` など）。明るい/暗いで値だけ入れ替える。
  - **コーラル＝人が押す所**（GitHub・Zenn・連絡・プラグ）。**ティール＝流れ・いま**（読んでいる所・製作中・ケーブル）。
  - 状態は色だけで伝えない（✓ の丸・回る矢印・点線の丸のアイコンと言葉を添える）。teal は canvas の上の小さな文字に使わない（teal-ink）。
- フォント: Zen Kaku Gothic New（見出し 900・本文 400/500）/ JetBrains Mono（年・数）。ロゴだけ Outfit 600 のアウトライン（`Logo.astro`）。
- 文字の大きさ: 本文と操作 16px 以上・注と札 14px 以上。押せる所の枠は `edge`（3:1 以上）、44px 以上の高さ。
- 角と影（やわらか）: 札 6・ボタン 8・カード 14・面 20・チップ 999。明るい画面は影、暗い画面は 1px の輪。
- 構図: ページ＝作業台（canvas + 点の方眼）。セクション＝ブロック（`FlowNode.astro`）を左のティールのケーブルでつなぎ、
  ブロックの左の縁のコンセントにコーラルのプラグが差さる。目次＝「流れ」（`FlowRail.astro`。lg 以上は右に固定、未満はダイアログ）。
- アイコン: Lucide（ISC）を `Icon.astro` に写す。外から読み込まない。
- 動き: ブロックが画面に入るとプラグが差さる（1 回だけ・`transform`/`opacity` だけ）。`prefers-reduced-motion` と JS 無しは差さった形で静止。
- 装飾は純装飾（`aria-hidden`）。旧仕様（`bauhaus-2026`・`redesign-2026-bold`・`components/*`）の見た目の決まりは履歴。

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
