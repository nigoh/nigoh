# サイト全体仕様

## 概要
H.Nigo（Hironobu Nigo）の個人自己紹介・ポートフォリオサイト。

## 技術スタック
- **フレームワーク**: Astro 5.x
- **CSS**: Tailwind CSS 3.x
- **言語**: TypeScript (strict モード)
- **デプロイ**: GitHub Pages (`https://nigoh.github.io/nigoh/`)
- **CI/CD**: GitHub Actions

## ページ構成
| ページ | パス | 説明 |
|--------|------|------|
| トップ | `/` | Hero + About + Skills |

## デザイン方針
- **テーマカラー**: エメラルドグリーン (`emerald-600` = `#059669`)
- **フォント**: Noto Sans JP + system-ui
- **アプローチ**: モバイルファースト、レスポンシブデザイン
- **スタイル**: ミニマル＆モダン、余白を活かしたクリーンなデザイン

## レスポンシブブレークポイント
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## パフォーマンス目標
- Lighthouse Performance: 90+
- Lighthouse Accessibility: 95+
- First Contentful Paint: < 1.5s

## SEO
- 各ページに固有の `<title>` と `<meta description>`
- OGP メタタグ
- セマンティック HTML

## 受入条件
- [ ] トップページが正しく表示される
- [ ] レスポンシブデザインが動作する（モバイル〜デスクトップ）
- [ ] Lighthouse スコアが目標値を満たす
- [ ] GitHub Pages にデプロイできる
- [ ] `astro check` でエラーがない
