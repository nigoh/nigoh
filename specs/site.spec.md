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
| トップ | `/` | Hero + About + Skills + Timeline + Portfolio + Contact |

## デザイン方針
- **テーマ**: プロフェッショナル＆フォーマル
- **カラーモード**: ダーク/ライト両対応（`darkMode: 'class'`、`prefers-color-scheme` 連動 + 手動切替 `localStorage` 保持）
- **アクセントカラー**: ブルー系（ライト: `blue-600`、ダーク: `blue-400`）
- **ライトモード背景**: `slate-50` / `white`
- **ダークモード背景**: `slate-900` / `slate-800`
- **フォント**: Noto Sans JP（本文） + JetBrains Mono（コード・数値表示）
- **アプローチ**: モバイルファースト、レスポンシブデザイン
- **スタイル**: プロフェッショナル＆フォーマル、余白を活かした洗練されたデザイン
- **アニメーション**: 控えめなフェードイン（`fade-in`）

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
- OGP メタタグ
- セマンティック HTML

## 受入条件
- [ ] トップページが正しく表示される
- [ ] ライトモード/ダークモードが正常に切り替わる
- [ ] テーマ設定が `localStorage` に保持される
- [ ] `prefers-color-scheme` に連動して初期テーマが決まる
- [ ] レスポンシブデザインが動作する（モバイル〜デスクトップ）
- [ ] モバイルでハンバーガーメニューが動作する
- [ ] Lighthouse スコアが目標値を満たす
- [ ] GitHub Pages にデプロイできる
- [ ] `astro check` でエラーがない
