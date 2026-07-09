# サイト全体仕様

## 概要
H.Nigo（Hironobu Nigo）の個人自己紹介・履歴書・スキル表サイト。1ページ完結型。

## 技術スタック
- **フレームワーク**: Astro 5.x
- **CSS**: Tailwind CSS 3.x
- **言語**: TypeScript (strict モード)
- **デプロイ**: GitHub Pages (`https://nigoh.github.io/nigoh/`)
- **CI/CD**: GitHub Actions

## ページ構成
| ページ | パス | 説明 |
|--------|------|------|
| トップ | `/` | Hero + About + Skills + AI + Career + Portfolio + Contact |

## デザイン方針
- **テーマ**: ロシア構成主義（エル・リシツキー「About Two Squares」1922 年にインスパイア）
- **カラーモード**: シングルモード（ダーク/ライト切替なし）
- **カラーパレット**:
  - Red: `#D62828`（アクセント・幾何学図形）
  - Black: `#1A1A1A`（ヘッダー・セクション背景）
  - Cream: `#F5F0EB`（本文背景・テキスト on dark）
  - Gray: `#8B8680`（補助テキスト）
  - DarkGray: `#3D3A37`（本文テキスト on light）
- **フォント**: Bebas Neue（見出し・ナビ） + Inter / Noto Sans JP（本文） + JetBrains Mono（数値）
- **アプローチ**: モバイルファースト、レスポンシブデザイン
- **スタイル**: 幾何学的・アシンメトリック構成、シャープなエッジ（角丸なし）、ボールドタイポグラフィ、大文字使い
- **装飾**: 赤い正方形・円・斜線などの幾何学図形をセクション背景に配置
- **アニメーション**: entrance は react-spring（`FadeIn` 等・reduced-motion 対応）、
  スクロール駆動リビール・進捗バー・マーキー等の 2026 リフレッシュは
  `specs/components/trends-2026-refresh.spec.md` が正典（easing は linear/steps に限定。
  旧 `slide-in` 系 CSS keyframes は未使用のため削除対象）
- **フォント読み込み**: `<head>` の preconnect + `<link>`（`display=swap`）。CSS `@import` は使わない
  （trends-2026-refresh.spec F-5）

## レスポンシブブレークポイント
- Mobile: < 640px（ハンバーガーメニュー）
- Tablet: 640px - 1024px
- Desktop: > 1024px

## パフォーマンス目標
- Lighthouse Performance: 90+
- Lighthouse Accessibility: 95+
- First Contentful Paint: < 1.5s

## SEO
- 各ページに固有の `<title>` と `<meta description>`
- OGP / Twitter Card メタタグ
- 構造化データ（JSON-LD `Person`、`knowsAbout` に主要技術を列挙）
- セマンティック HTML

## 受入条件
- [x] トップページが正しく表示される
- [x] ロシア構成主義スタイルのデザインが適用されている
- [x] レスポンシブデザインが動作する（モバイル〜デスクトップ）
- [x] モバイルでハンバーガーメニューが動作する
- [ ] Lighthouse スコアが目標値を満たす
- [ ] GitHub Pages にデプロイできる
- [x] `astro check` でエラーがない
