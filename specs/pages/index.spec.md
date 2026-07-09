# トップページ仕様

## 目的
訪問者に H.Nigo の概要・スキル・経歴・AI 活用を伝える 1 ページ完結型の履歴書・スキル表サイト。

## パス
`/` (`src/pages/index.astro`)

## デザイン言語
ロシア構成主義（エル・リシツキー）。パレットは `tailwind.config.mjs` の `constructivist.*`
（red `#D62828` / black `#1A1A1A` / cream `#F5F0EB` / gray `#8B8680` / darkgray `#3D3A37`）が唯一の出典。
角丸なし・シャープエッジ・ボールドタイポ・大文字見出し。詳細は CLAUDE.md と `specs/components/*`。

## セクション構成

### 1. Hero セクション
- 背景 `bg-constructivist-black`、`min-h-[90vh]`
- El Lissitzky 風 3D Proun 装飾（`ProunCanvas`, Three.js・軸測投影, `client:visible`）
- `AnimatedHero`（名前「H.NIGO」/ 役割「SOFTWARE ENGINEER」/ 一行自己紹介 / GitHub リンク・アバター）
- 自己紹介文に C/C++・TypeScript・Python と AI ツール活用を明記

### 2. About セクション（`#about`）
- 構成主義タイル装飾（`ConstructivistCanvas section="about"`）＋左端の赤い縦帯
- 2 カラム（md 以上）:
  - 左: 基本情報 `dl`（Name / Born / Location / Role）— `border-l-4` のシャープなカード
  - 右: 自己紹介文（現在の組み込み Android（Java）開発を含む）

### 3. Skills セクション（`#skills`）
- 背景 `bg-constructivist-black`、`ConstructivistCanvas section="skills"`
- カテゴリ別グループ（`AnimatedSkillBar`）は 4 カテゴリに集約: LANGUAGES / PLATFORMS /
  DEV & INFRA / AI-DRIVEN DEV（各 2〜4 項目・計 13 項目程度）。各スキルに赤系プログレスバー＋パーセント
- 近い技術は 1 項目にまとめる（例: TypeScript / JavaScript、Git / GitLab、RDB (PostgreSQL / Oracle)）
- GitHub Activity: コントリビューションカレンダー・Stars/Followers バッジ・
  言語分布グラフ（ビルド時に GitHub API から取得、失敗時はバッジへフォールバック）

### 4. AI-Powered Dev セクション（`#ai`）
- `ConstructivistCanvas section="ai"`
- `aiTools` 配列を 2 カラムグリッドで描画（Claude Code / Copilot SWE Agent / Codex /
  MCP / Agent Config / Spec-Driven Dev）。各カードは Heroicons outline アイコン＋説明
- INTEREST & FOCUS: RAG / 開発フロー整備 / 技術普及の 3 枚

### 5. Career セクション（`#career`）
- 背景 `bg-constructivist-black`、赤い縦軸＋ダイヤモンドマーカーのタイムライン
- 7 エントリ（2026 組み込み Android 〜 2016 初期）。年・期間・業種・担当工程・技術スタックを記載
- クライアント名・案件番号・具体的な機器名/製品名・詳細な期間は非掲載。
  業務案件は「社会インフラ機器」「専用端末」のような一般化した表現のみ使う（CLAUDE.md 規約）

### 6. Portfolio セクション（`#portfolio`）
- カードはビルド時に GitHub API（公開リポジトリ）から自動生成し、push 日時の新しい順に最大 8 件を
  カードグリッドで描画（リンク・ホバー・タグバッジ＝主要言語）＋右端の赤い縦帯
  - 除外: fork・アーカイブ・業務関連リポジトリ（`excludedRepos` パターン: faj / do_hug 系）
  - 直近 90 日以内に push があるカードは赤地の「IN PROGRESS」バッジを表示（現在製作中の反映）
  - API 取得失敗時は代表的な公開リポジトリの静的フォールバックカードを表示
- Blog (Zenn): ビルド時に Zenn API から最新記事を取得、失敗時はフォールバックカード

### 7. Contact セクション（`#contact`）
- 背景 `bg-constructivist-black`、中央寄せ、装飾的幾何学（円・回転矩形, `aria-hidden`）
- GitHub リンクボタン（`bg-constructivist-red`）

## デザイン指針
- セクション間パディング: `py-20`
- 背景は cream / black の交互。装飾は純装飾で `aria-hidden`
- カードは角丸なし・`border-2`／`border-l-4` のシャープエッジ、隣接セルは枠線を共有
- 配色は `constructivist.*` のみを使用（新色を足さない）
- 2026 トレンド取り込み（流体タイポ・スクロール駆動リビール・進捗バー・セクション番号・
  版ずれホバー・grain・Skills/AI 境界のマーキー帯）は `specs/components/trends-2026-refresh.spec.md` に従う

## 受入条件
- [ ] Hero に 3D Proun 装飾と H.NIGO の一行自己紹介・GitHub リンクが表示される
- [ ] About が 2 カラムで表示され、現在の Android（Java）開発に言及している
- [ ] Skills が 4 カテゴリ（LANGUAGES / PLATFORMS / DEV & INFRA / AI-DRIVEN DEV）の
      プログレスバーで表示され、Android SDK を含む
- [ ] GitHub Activity（カレンダー・バッジ・言語分布）が表示される
- [ ] AI-Powered Dev に Claude Code を含む各カードが表示される
- [ ] Career が 7 エントリのタイムラインで表示され、最新が 2026 の組み込み Android である
- [ ] Portfolio カードが表示される（GitHub API 成功時は自動生成、失敗時はフォールバック。
      いずれも faj / do_hug 系リポジトリを含まない）
- [ ] Career・Portfolio に業務案件の具体的な機器名・製品名が含まれない
- [ ] Zenn 記事一覧が表示される
- [ ] Contact に GitHub リンクボタンが表示される
- [ ] 全セクションがモバイルで正しく表示される
- [ ] `npx astro check` が 0 エラー、`npm run build` が成功する
