# トップページ仕様

## 目的
訪問者に H.Nigo の概要・スキル・経歴を伝える1ページ完結型の履歴書・スキル表サイト。

## パス
`/` (`src/pages/index.astro`)

## セクション構成

### 1. Hero セクション
- GitHub アバター画像（丸型、`ring-4` 装飾、120x120）
- 名前: 「H.Nigo」（`text-3xl sm:text-4xl font-bold`）
- 役割表記: 「Software Engineer」（ブルーアクセント）
- 簡潔な一行自己紹介
- GitHub プロフィールリンク（アイコン付き）
- コンパクトヘッダー形式（フルスクリーンではない）
- パディング: `py-20 sm:py-28`

### 2. About セクション
- 2カラムレイアウト（sm以上）:
  - 左: 基本情報カード（Name / Born / Location / Role）— `dl` 要素、カードスタイル
  - 右: 自己紹介文（2段落）
- 背景: `bg-slate-100/50 dark:bg-slate-800/30`（交互背景）

### 3. Skills セクション
- カテゴリ別グループ:
  - Languages: C/C++ (90%), Rust (75%), Python (80%)
  - Tools & Infrastructure: Git (90%), Linux (85%), Docker (80%)
- 各スキルにプログレスバー（ブルーグラデーション）＋パーセント表示
- GitHub Stats カード（ライト/ダーク別画像、readme-stats 2枚）

### 4. Timeline セクション
- 縦タイムライン形式（左寄せ年号 + ドット + 説明）
- 4イベント: 1984 Born / 2000s Programming / 2010s Career / 2020s Now
- 背景: 交互背景（`bg-slate-100/50 dark:bg-slate-800/30`）

### 5. Portfolio セクション
- プロジェクトカード（リンク付き、ホバーエフェクト + タグバッジ）
- Blog 準備中セクション

### 6. Contact セクション
- 中央寄せ、簡潔な説明文
- GitHub リンクボタン（`bg-blue-600` ソリッドボタン）
- 背景: 交互背景

## デザイン指針
- セクション間のパディング: `py-20`
- 交互背景: `bg-slate-100/50 dark:bg-slate-800/30` と透明の繰り返し
- カード: `rounded-xl` + `shadow-sm` + `border` + ホバーで `shadow-md`
- ダーク/ライト両対応のカラークラスを全要素に適用

## 受入条件
- [ ] Hero セクションがコンパクトに表示される（フルスクリーンではない）
- [ ] About セクションが2カラムで表示される（sm以上）
- [ ] Skills がカテゴリ別にプログレスバーで表示される
- [ ] GitHub Stats がライト/ダーク別に適切な画像で表示される
- [ ] Timeline が縦タイムラインで表示される
- [ ] Portfolio カードがホバーエフェクト付きで表示される
- [ ] Contact に GitHub リンクボタンが表示される
- [ ] ライト/ダークモードで全セクションが正しく表示される
- [ ] 全セクションがモバイルで正しく表示される
