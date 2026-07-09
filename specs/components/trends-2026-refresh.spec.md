# 2026 トレンド取り込みリフレッシュ（構成主義言語内での変奏）

> ステータス: **設計確定（デザイナー）。実装は frontend**。
> 対象: `src/styles/global.css` / `tailwind.config.mjs`（トークン追加のみ）/ `src/pages/index.astro` /
> `src/components/AnimatedHero.tsx` / `src/components/Header.astro` / `src/layouts/BaseLayout.astro` /
> `src/components/AnimatedSkillBar.tsx`。
> 前提 spec: `specs/a11y.spec.md`（コントラスト行列＝拘束条件）/ `specs/responsive.spec.md` /
> `specs/polish.spec.md` / `specs/components/decoration.spec.md`。

---

## 1. 背景 / 目的

2026 年のデザイントレンドのうち **構成主義（エル・リシツキー）の語彙で解釈し直せるものだけ** を取り込み、
サイトの鮮度と体験密度を上げる。語彙は増やさない — 既存の「赤い正方形・円・斜線・楔・太い罫線・
Bebas の大文字」を、**時間軸（スクロール）と物質感(紙・版ずれ)** に拡張するのが本 spec の核。

### トレンドと構成主義的解釈の対応

| 2026 トレンド | 構成主義的解釈（このサイトでの意味） | 採用 |
|---|---|---|
| スクロールテリング / CSS scroll-driven animations | 「About Two Squares」= ページをめくる絵本。スクロール＝頁送りとして、罫線が引かれ・ブロックが対角に据わる | ○ T1 / T6 |
| キネティック / オーバーサイズタイポ | 極大 Bebas は既に核。固定 px を `clamp()` 流体化し、どの幅でも「極大」が成立するようにする | ○ T5（流体化のみ） |
| 「反 AI」的な紙の質感（grain / 活版・リトグラフ） | 1920 年代のリトグラフポスターの紙肌。cream 面に微細な粒子 | ○ T4 |
| 版ずれ（misregistration）マイクロインタラクション | 2 色刷りの刷り位置ズレ。hover で赤の複製レイヤーが 2〜4px ズレて現れる。即時・機械的 | ○ T3 |
| アジプロ・マーキー / ティッカー | ROSTA の窓・アジプロ列車の帯。スキル語を赤帯に載せて等速で流す | ○ T7 |
| ネオブルータリズム | 生の構造・ヘアライン罫線・角丸ゼロ — 既にこのサイトの姿。個別採用は不要（現状が該当） | —（内包） |
| `text-wrap: balance` | 見出しの折返し均衡。Baseline 済みで無条件採用 | ○ T2 |
| glassmorphism / neumorphism / 角丸 bento / パステル / バウンシー easing | 構成主義と非両立 | **採用禁止** |
| ダークモード切替 | 今回スコープ外（site.spec: シングルモード） | 対象外 |

### 採用ポリシー（maximalism 回避）

Tier 1 全部（T1〜T4）＋ Tier 2 から **3 点に限定**（T5 流体タイポ / T6 スクロールテリング構造 /
T7 マーキー）。Tier 3（bento 化・大型 mono 数値の全面展開等）は**今回見送り**。
mono 数値は「§9 整合性修正」の範囲（既存 spec の未達解消）でのみ触る。
**モーションの easing は全項目 `linear` または `steps()`（即時）に限定**する。バウンス・オーバーシュート禁止。

---

## 2. T1 — スクロール駆動セクションリビール（CSS `view()` タイムライン）

### デザイン指針

各セクションの**見出しグループ**（§7 のセクション番号 + `h2` + 新設の赤い下罫線）を
CSS scroll-driven animation でリビールする。JS 不要・メインスレッド非依存。

- **赤い下罫線（新設・純装飾）**: `h2` の直下に `h-1`（4px）× 幅 `w-24`〜`w-32` の
  `bg-constructivist-red` バーを置き、`transform: scaleX(0) → scaleX(1)`・`transform-origin: left` で
  「罫線が引かれる」動きにする。`aria-hidden="true"`。
- **見出し本体**: `opacity 0 → 1` ＋ `translate(-24px, 12px) → translate(0, 0)`（**左下→定位置**の対角、
  Hero の対角力線と同じ向き）。
- **タイムライン**: `animation-timeline: view()`、`animation-range: entry 0% cover 30%`。
  duration はタイムライン駆動のため名目値（`1s` などのプレースホルダ）。
- **easing**: `linear`（スクロール量に正比例。機械的＝構成主義的）。
- **FadeIn との二重アニメ禁止**: 本リビールを適用する見出しグループからは既存の
  `<FadeIn direction="left">` ラッパーを**外す**（同一要素に entrance と scroll-driven を重ねない）。
  本文ブロック側の `FadeIn`（direction="up" 等）は現状維持（今回のスコープ外。将来の CSS 移行は別 spec）。
- **非対応ブラウザ（Firefox 等）**: 見出しは**静的表示**（アニメなし・最終状態）。
  `@supports (animation-timeline: view())` の外では `opacity`/`transform` を触らない実装にする
  （＝ゲート内でのみ初期状態を 0 にする。ゲート外で不可視にならないこと）。

### 数値まとめ

| 項目 | 値 |
|---|---|
| 罫線 | `h-1 w-24`（モバイル）〜 `w-32`（sm 以上）、red、scaleX 0→1、origin left |
| 見出し | opacity 0→1、translate(-24px, 12px)→(0,0) |
| range | `entry 0% cover 30%` |
| easing | `linear` |
| ゲート | `@supports (animation-timeline: view())` **かつ** `@media (prefers-reduced-motion: no-preference)` |

> **重要（a11y）**: `global.css` の reduced-motion グローバルガードは `animation-duration` を潰す方式だが、
> **scroll-driven animation は duration を参照しないため効かない**。スクロール駆動の宣言は必ず
> `@media (prefers-reduced-motion: no-preference)` の**内側**に書くこと（T6 も同様）。

---

## 3. T2 — `text-wrap: balance`（見出しの折返し均衡）

- `global.css` に `h1, h2, h3, h4 { text-wrap: balance; }` を追加（Baseline 済み・ゲート不要）。
- 本文段落には任意で `p { text-wrap: pretty; }` を**進歩的に**適用してよい（非対応でも無害）。
- 対象は折返しが起こるモバイル幅の見出し（AI カード名・Portfolio カード名・Career 業種など）。
  Bebas 一語見出し（ABOUT 等）には実質影響なし＝副作用なし。

---

## 4. T3 — 版ずれ（misregistration）ホバー

### コンセプト

2 色刷りリトグラフの**刷り位置ズレ**。hover / focus-visible で赤い複製が 2〜4px ズレて出現する。
**トランジションは 0s（即時）**。フェードもスライドもしない — 「刷られた/刷られてない」の 2 状態のみ。
これが 2026 の「機械的・即物的マイクロインタラクション」の構成主義的回答。

### 適用先と数値

| 対象 | 手法 | 値 |
|---|---|---|
| Header ナビリンク（cream on black） | `text-shadow` | hover 時 `text-shadow: 2px 2px 0 #D62828`。文字色は cream を**維持**（red 化しない） |
| Hero「GITHUB.COM/NIGOH」リンク | `text-shadow` | 同上 `2px 2px 0 red`。現状の `group-hover:text-constructivist-red`（小さめ文字の red 化）は**廃止**し版ずれに置換 |
| Contact CTA ボタン（red 面） | `box-shadow` | hover 時 `box-shadow: 4px 4px 0 0 #1A1A1A`（黒版のズレ）。既存の red→cream 反転は維持しつつ `duration-200` → **`duration-0`（即時）** |
| Portfolio / Zenn カード | `box-shadow` | hover 時 `box-shadow: 4px 4px 0 0 #D62828`。translate はしない（浮かせない・ズレるだけ）。既存の色反転も即時化 |

- shadow はぼかし 0・広がり 0 の**シャープな複製**のみ（blur 禁止）。
- 色は red / black のみ（パレット内）。shadow は非テキストの装飾でありコントラスト要件対象外。
  **地のテキスト自体の AA は不変に保つ**（cream 文字を維持する理由。a11y.spec「hover の red は大テキストか下線付きに限る」とも整合し、小テキストの red 化を除去できる）。
- `:focus-visible` の outline（既存 R-FOCUS）はそのまま**併存**させる（版ずれは focus の代替にしない）。
- reduced-motion: 状態変化は瞬時（アニメではない）ため制約なし。ガード不要。

---

## 5. T4 — 紙の grain オーバーレイ（cream 面）

### デザイン指針

1920 年代リトグラフの紙肌。**cream 背景セクション（About / AI / Portfolio）と body の cream 地のみ**に、
SVG `feTurbulence` の微細ノイズを重ねる。黒地セクションはインクの黒＝ベタのままにして
明暗の物質感を対比させる（黒面には適用しない）。

### 実装指針・数値

- data-URI の SVG 1 枚を repeating background にする擬似要素 or オーバーレイ div。追加依存なし。
  ```
  <svg xmlns="..." width="160" height="160">
    <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/></filter>
    <rect width="160" height="160" filter="url(#g)"/>
  </svg>
  ```
- **baseFrequency `0.9`（許容 0.8〜1.2）/ numOctaves `2` / タイル 160px / `stitchTiles="stitch"`**。
- 重ね方: `position: absolute; inset: 0`、**`opacity: 0.05`（上限 0.06）**、`mix-blend-mode: multiply`、
  `pointer-events: none`、`aria-hidden="true"`、z は装飾 canvas より上・本文 `z-10` より下。
- 静止画である（アニメーションさせない）。「動く grain」は禁止 — 紙は動かない。
- **コントラスト保全**: opacity ≤ 0.06 の黒 grain が cream に乗った場合の実効コントラスト低下は
  darkgray/cream 9.98:1 → 約 9.4:1、gray/black 等の黒地は非適用で不変。**全ペアが AA を維持**する。
  0.06 を超える値は不可。

---

## 6. T5 — 流体タイポグラフィ（`clamp()`、Hero と h2）

### デザイン指針

「オーバーサイズタイポ」は既にこのサイトの核。固定 rem の段階指定を `clamp()` に置換し、
**どのビューポート幅でも極大が極大として成立**させる（キネティックタイポの採用は
この流体化までに限定。スクロール連動の文字変形・楔の回転は**過剰のため不採用**）。

### トークン提案（`tailwind.config.mjs` に fontSize を追加 — 新色ではないため可）

```js
fontSize: {
  // Hero H1: 390px で 5.5rem 〜 1280px で 10rem（現状の両端値を保存し中間を連続化）
  'display-fluid': ['clamp(5.5rem, 3.5rem + 8vw, 10rem)', { lineHeight: '1' }],
  // セクション h2: 現状 text-5xl(3rem) → sm:text-6xl(3.75rem) の連続化
  'heading-fluid': ['clamp(3rem, 2.25rem + 3vw, 3.75rem)', { lineHeight: '1.1' }],
}
```

- 適用: `AnimatedHero` の H1 `text-[5.5rem] sm:text-[8rem] lg:text-[10rem]` → `text-display-fluid`。
  各セクション `h2` の `text-5xl sm:text-6xl` → `text-heading-fluid`。
- polish.spec の「h2 は全セクション同一」原則は**流体トークンでも全 7 セクション同一**を維持すること。
- 任意値クラス（`text-[...]`）の残存をゼロにする（polish.spec「任意値の新規追加なし」と整合）。
- タイポ 3 段跳躍（H1 極大 → 赤帯 → 説明文）の比率は不変（decoration.spec Hero 受入と整合）。

---

## 7. T6 — スクロールテリング構造（進捗バー・セクション番号・ナビ現在地）

「About Two Squares」の絵本構造 — **いま何頁目か** — を可視化する。

### 7a. スクロール進捗バー（scroll() タイムライン）

- ビューポート最上端に固定（`position: fixed; top: 0; left: 0; right: 0`）、**高さ `3px`**、
  `bg-constructivist-red`。Header（black）の上端に重なる — red on black 3.48:1 は
  非テキスト 3:1 を満たす。z-index は Header より上。
- `transform: scaleX(0) → scaleX(1)`・`transform-origin: left`・
  `animation-timeline: scroll(root block)`・easing `linear`。
- **ゲート**: 要素は既定 `display: none` とし、`@supports (animation-timeline: scroll())` 内でのみ表示。
  さらに `@media (prefers-reduced-motion: no-preference)` 内に置く（reduce 時・非対応時は**存在しない**。
  中途半端な固定赤バーを残さない）。
- `aria-hidden="true"`（純装飾。ページ内位置はスクロールバーが既に伝えている）。

### 7b. セクション番号（JetBrains Mono）

- 各セクション `h2` の直上に mono の頁番号を置く: 書式 **`02 / 07`**（about=02 … contact=07。
  Hero の既存装飾「01」が 01 を担う — 既存語彙との接続）。
- スタイル: `font-mono text-xs tracking-widest`。色は**背景で切替**:
  cream 地 → `text-constructivist-darkgray`（9.98:1）/ black 地 → `text-constructivist-gray`（4.82:1）。
  **red は使わない**（小テキスト red 禁止 — a11y.spec）。
- 番号は情報冗長（ナビと見出しがある）だが読み上げ害も小さい。**`aria-hidden="true"` で装飾扱い**とする。
- T1 のリビール（見出しグループ）に含めて一緒に現れる。

### 7c. ナビの現在地表示（aria-current）

- `IntersectionObserver` で可視セクションを検知し、対応するナビリンクに **`aria-current="true"`** を付与
  （こちらは装飾ではなく**情報**なので aria で正しく公開する）。
- 視覚表現: リンク下端に `h-0.5`（2px）の `bg-constructivist-red` バー（非テキスト 3:1 OK）。
  文字色は cream のまま（red 小テキスト禁止）。バーの出現は即時（トランジション 0s、版ずれと同じ即物性）。
- JS は Header の既存インラインスクリプト程度の最小実装（新規依存なし）。
  reduced-motion でも機能する（状態表示でありアニメではない）。

---

## 8. T7 — アジプロ・マーキーバンド（スキルティッカー）

### デザイン指針

ROSTA/アジプロ列車の帯。**Skills（black）と AI（cream）の境界に 1 本だけ**、全幅の赤帯を敷き、
スキル語を等速で流す。サイトに 1 箇所限定（複数配置は禁止 — 過剰化の一線）。

### 数値・構成

| 項目 | 値 |
|---|---|
| 帯 | 全幅 `bg-constructivist-red`、`py-3`、border なし・角丸なし |
| 文字 | Bebas（`font-sans`）**`text-3xl`（30px）** uppercase、`text-constructivist-cream`、`tracking-wider` |
| 区切り | 語間に `w-2 h-2 bg-constructivist-cream rotate-45` の小ダイヤ（Career マーカーの語彙を反復） |
| 内容 | 既存キーワードの反復のみ: `C/C++ ◆ JAVA ◆ TYPESCRIPT ◆ PYTHON ◆ AI-DRIVEN DEV ◆ SPEC-DRIVEN DEV ◆ SAPPORO, JAPAN` 等。**新情報を載せない** |
| 動き | トラックを 2 連複製し `translateX(0 → -50%)` を `linear infinite`。**速度は等速 ≈50px/s**（トラック幅から duration を算出。目安 40〜60s/ループ）。ホバーで止めない（機械は止まらない） |
| a11y | 帯全体を **`aria-hidden="true"`**（内容は Skills 本文の完全な重複＝純装飾）。`overflow: hidden` でスクロールバーを出さない |
| コントラスト | cream on red 4.42:1 — 30px の大テキストで AA(3:1) を満たす。**24px 未満に縮めない**（モバイルも `text-3xl` 維持可、はみ出しは overflow で切れるだけ） |
| reduced-motion | keyframes を `@media (prefers-reduced-motion: no-preference)` 内に置き、reduce 時は**静止した赤帯**（先頭部分が読める状態）として残す |

---

## 9. 整合性修正（トレンド以前の負債解消 — 同時に実施）

| ID | 対象 | 判定と指針 |
|---|---|---|
| F-1 | Contact の `rounded-full` 装飾円（`index.astro` L663） | **非違反・維持**。円は構成主義の一次語彙（decoration.spec タイルセット ID4、Contact 変奏「大円＋単一の赤四角」に合致）。「角丸禁止」は**矩形の角の丸め**を禁じる規則であり、真円はその対象外。コードの意図明確化のためコメント追記は任意 |
| F-2 | Career の ⚠️ 絵文字（L513） | **除去**。絵文字は幾何学言語と非整合。代替: 文頭に `w-2 h-2 bg-constructivist-red rotate-45 inline-block`（`aria-hidden`）の小ダイヤ＋テキスト「注: 」。ダイヤはタイムラインマーカーの語彙の反復 |
| F-3 | 未使用コード | **削除**: `src/components/AnimatedTimeline.tsx`、`global.css` の `slide-in` / `wedge-in` / `proun-float` keyframes と `.animate-slide-in` / `.animate-wedge-in` / `.animate-proun` / `.animate-delay-*`。site.spec の該当記述も更新済み（本 spec 参照へ差替え） |
| F-4 | font-mono 未使用（数値=mono の未達） | **適用**: ① `AnimatedSkillBar` の % 数値（`text-2xl` red のまま → `font-mono` 追加。24px red は大テキスト 3:1 OK）② Career の期間表記（`item.period`, `text-xs` gray on black 4.82 OK）③ §7b のセクション番号。**Career 年号（Bebas text-2xl）と About の `1984` は据え置き**（見出し級のディスプレイ数字は Bebas が正 — 「データ数値は mono、ディスプレイ数字は Bebas」を規則として確定） |
| F-5 | Google Fonts の render-blocking `@import` | `global.css` の `@import` を廃し、`BaseLayout.astro` の `<head>` に `<link rel="preconnect" href="https://fonts.googleapis.com">` + `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` + `<link rel="stylesheet" ... display=swap>` を移設。ウェイト構成は現状維持（Bebas 400 / Inter 400-700 / JetBrains Mono 400-700 / Noto Sans JP 400-700）。セルフホスト化は将来の別課題（今回は移設のみ） |
| F-6 | ブレークポイント不統一（ナビ `sm` / Hero スタック `md`） | **現状維持を明文化**。ナビ 6 項目は 640px で横並び可能、Hero の 2 カラムは avatar 幅の都合で 768px が必要 — コンテンツ都合の差であり統一は不要。ただし新規要素（マーキー・進捗バー）はブレークポイント非依存（全幅）で設計しズレを増やさない |

---

## 10. a11y 制約まとめ（拘束条件）

- **コントラスト行列**（a11y.spec）を全新規要素で遵守:
  red の文字は 24px+（または 18.66px+ bold）のみ / cream 地の小テキストは darkgray /
  black 地の小テキストは gray 以上 / red 地は cream 大テキストのみ / gray on red 禁止。
- 新規装飾（罫線・進捗バー・grain・マーキー・番号・版ずれ shadow）はすべて**純装飾**:
  `aria-hidden="true"`＋`pointer-events: none`（マーキーは overflow hidden）。情報を持たせない。
  例外は §7c の `aria-current`（情報なので aria で公開）。
- **prefers-reduced-motion**: スクロール駆動（T1/T6a）とマーキー（T7）は
  `@media (prefers-reduced-motion: no-preference)` の**内側**に宣言する（既存グローバルガードは
  duration ベースのため scroll-driven に効かない）。reduce 時: 見出し=静的表示 / 進捗バー=非表示 /
  マーキー=静止帯 / 版ずれ=状態変化のみなので対象外。
- grain は opacity ≤ 0.06 でテキストコントラストを AA 未満に落とさない。
- `:focus-visible` リング（既存 R-FOCUS）は全新規インタラクション（版ずれ hover 対象）で不変に機能する。

## 11. `@supports` ゲート方針（プログレッシブエンハンスメント）

| 機能 | ゲート | 非対応時の見え |
|---|---|---|
| T1 リビール | `@supports (animation-timeline: view())` + PRM no-preference | 見出しは静的に最終状態（不可視化しない） |
| T6a 進捗バー | `@supports (animation-timeline: scroll())` + PRM no-preference | 要素ごと非表示（`display: none` が既定） |
| T2 balance / pretty | 不要（Baseline / 無害宣言） | 通常折返し |
| T3 / T4 / T7 / T6b / T6c | 不要（全ブラウザで動く基本 CSS/JS） | — |

原則: **初期状態を隠す宣言（opacity: 0 等）は必ずゲートの内側**に書く。ゲート外で
コンテンツが不可視のまま残るパターンを絶対に作らない（Firefox で見出しが消える事故の防止）。

## 12. トークン追加提案（tailwind.config.mjs）

- `fontSize.display-fluid` / `fontSize.heading-fluid`（§6 の clamp 値）。**色の追加はゼロ**
  （grain・shadow・帯・バーはすべて `constructivist.*` の 5 色内）。

---

## 13. 受入条件

### T1 リビール
- [x] 全 7 セクションの見出しグループ（番号＋h2＋赤罫線）が view() タイムラインで
      「罫線 scaleX 0→1・見出し左下→定位置」のリビールをする（Chrome/Edge/Safari）。easing は linear。
      （Hero は既存の「01」装飾が担当。h2 を持つ 6 セクションに適用）
- [x] Firefox（非対応）で見出しが**静的に完全表示**される（opacity 0 で残らない）。
      （初期隠蔽の宣言は `@supports (animation-timeline: view())` 内のみ — ビルド CSS で確認済み）
- [x] reduced-motion で見出しが静的に完全表示される。
- [x] リビール適用済みの見出しに FadeIn ラッパーが残っていない（二重アニメなし）。

### T2 タイポ折返し
- [x] `h1,h2,h3,h4` に `text-wrap: balance` が効いている（モバイル幅で AI/Portfolio カード名の折返しが均衡）。

### T3 版ずれホバー
- [x] ナビ・Hero リンクの hover が「cream 文字＋red の 2px 版ずれ shadow」で、文字色の red 化がない。
- [x] Contact CTA / Portfolio / Zenn カードの hover が即時（transition 0s）で版ずれ shadow が付く。blur ゼロ。
- [x] `:focus-visible` リングが従来どおり全対象で可視。
      （版ずれは outline と別プロパティ — text-shadow / box-shadow — のため衝突しない）

### T4 grain
- [x] cream 面（body / About / AI / Portfolio）に静止 grain（baseFrequency≈0.9, opacity≤0.06）が乗り、黒面には乗らない。
      （可視の cream 面はこの 3 セクションで全域。body 直付けは黒面セクションに覆われ無意味のためセクション単位で適用）
- [x] grain 適用後も cream 地の全テキストペアが AA を満たす（darkgray/cream ≥ 9:1 目安）。opacity 0.05 で実装。
- [x] grain は `aria-hidden` / `pointer-events-none` で、操作・読み上げに影響しない。

### T5 流体タイポ
- [x] H1 が `text-display-fluid`、全 7 セクション h2 が `text-heading-fluid` で、任意値 `text-[...rem]` の残存ゼロ。
- [x] 390px / 768px / 1280px で従来サイズと同等以上の視覚階層（3 段跳躍）が保たれている
      （clamp の両端値は従来の 5.5rem / 10rem・3rem / 3.75rem を保存）。

### T6 スクロールテリング
- [x] 対応ブラウザで最上端 3px の赤い進捗バーがスクロールに等速追従する。非対応・reduce では要素が存在しない
      （既定 `display: none`、`@supports` + PRM ゲート内でのみ `display: block` — ビルド CSS で確認済み）。
- [x] 各 h2 直上に `02 / 07` 形式の mono 番号（cream 地=darkgray / black 地=gray、aria-hidden）が出る。
- [x] スクロールに応じてナビの現在セクションに `aria-current="true"` と 2px 赤下線が付く
      （Header の IntersectionObserver、rootMargin -40%/-55%）。

### T7 マーキー
- [x] Skills/AI 境界に赤帯マーキーが 1 本だけあり、Bebas `text-3xl` cream・等速 linear（約 50px/s ≈ 半幅/45s）で流れる。
- [x] 帯全体が `aria-hidden` で、内容は既存キーワードの重複のみ。reduce 時は静止帯として表示される。

### 整合性修正
- [x] F-2: ⚠️ 絵文字が除去され、赤ダイヤ（aria-hidden）＋「注:」に置換されている。
- [x] F-3: `AnimatedTimeline.tsx` と未使用 keyframes / `.animate-*` ユーティリティが削除され、ビルドが通る。
- [x] F-4: Skill % と Career period とセクション番号が `font-mono`。Career 年号・About 1984 は Bebas のまま。
- [x] F-5: `@import` が消え、フォントが `<head>` の preconnect + link（display=swap）で読み込まれる。
- [x] F-1: Contact の円は変更されていない（維持判定）。

### 横断
- [x] パレット外の色・角丸（矩形）・blur・バウンス easing の導入ゼロ。新規依存パッケージゼロ。
- [x] `npx astro check` 0 エラー（20 files / 0 errors / 0 warnings）、`npm run build` 成功。
- [ ] Lighthouse A11y 95+ を維持（未計測 — デプロイ後に計測する）。
- [x] 全新規モーションが PRM no-preference ゲート内にあり、reduce 環境で動くものがない（版ずれの状態変化を除く）。

---

## 14. frontend への実装メモ

- 実装順の推奨: F-3/F-5（負債除去）→ T2/T5（タイポ、静的）→ T3/T4（状態・質感）→ T1/T6（スクロール駆動）→ T7（マーキー）。
  各段で `astro check` + ビルド確認。
- T1/T6a の CSS は `global.css` にユーティリティクラスとして置く（例: `.reveal-heading`, `.scroll-progress`）。
  React 化不要 — **JS ゼロで書けるものに JS を足さない**。T6c のみ最小の vanilla JS（Header の既存
  インラインスクリプトに追記可）。
- マーキーのトラック複製は Astro テンプレートで配列を 2 回描画すれば足りる（JS 不要）。
- 進捗バーと Header の z-index 関係に注意（バーが上）。マーキーはセクション間の独立要素で、
  `ConstructivistCanvas` を持たない（装飾を重ねない）。
