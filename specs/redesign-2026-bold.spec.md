# 大胆刷新 2026 — Awwwards 級・構成主義の拡張（BOLD REDESIGN）

> ステータス: **設計確定（デザイナー）。本番実装は frontend**。
> 出典: ユーザーとの 5 ラウンド対話で確定したブリーフ（唯一の出典）。
> 前提 spec（拘束条件）: `specs/a11y.spec.md`（コントラスト行列）/ `specs/site.spec.md` /
> `specs/responsive.spec.md` / `specs/components/trends-2026-refresh.spec.md`（PR #11 の資産）/
> `specs/components/proun-3d.spec.md` / `specs/components/decoration.spec.md`（Phaser — 本 spec で退役）。
> プロトタイプ（視覚証明・依存なし）: `specs/prototypes/redesign-2026-bold.html`。
> 対象（frontend 実装範囲）: `src/pages/index.astro` / `src/styles/global.css` /
> `tailwind.config.mjs`（**色トークン追加ゼロ**・セマンティック CSS 変数の追加のみ） /
> `src/layouts/BaseLayout.astro` / `src/components/Header.astro` /
> `src/components/AnimatedHero.tsx` / `src/components/ProunCanvas`（フル3D化） / 新規 island 数点。

---

## 0. 背景 / 目的

現行サイトは PR #11「2026 トレンドリフレッシュ」で密度を上げた **整った構成主義ポスター**。
本 spec はここから **意図的に破壊と密度を一段引き上げ、Awwwards 級の「攻めた一発」** にする。
ただし DNA（5 色・幾何学・大文字・角丸なし・シャープエッジ・ボールドタイポ）は**一切薄めない**。
狙いは「語彙を増やす」ことではなく、**構図・スケール・時間軸・空間（3D）・反転（ダーク）**という
**変奏の軸**を大胆に振り切ること。エル・リシツキーの `About Two Squares` を、
「静かな絵本」から **「組み上がり・崩れ・反転する動的ポスター」** へ拡張する。

### 設計の 4 本柱（この順で強度を上げる）

1. **破壊的グリッド** — 整然とした縦積みを、重なり・はみ出し・非対称・回転で崩す（緩急つき）。
2. **キネティック・タイポ** — Bebas を transform で動かす（後述、可変フォントは**採らない**）。
3. **没入 3D + スクロール演出** — ヒーローをフルビューポートのスクロール駆動主役へ。
4. **反転（ダークモード）+ 実験的ナビ + 署名インタラクション** — ポスターの反転と地図索引と遊び。

---

## 1. デザイン原則の進化（現行 → 刷新）

| 原則 | 現行（PR #11） | 刷新（本 spec） |
|---|---|---|
| 構図 | 整列した縦積み・左寄せ見出し | **破壊的グリッド**（重なり・はみ出し・回転・非対称）。ただしセクションで**緩急** |
| スケール | 流体タイポ `clamp()` | 流体を土台に、**loud セクションで極大＋キネティック変形**を上乗せ |
| 時間軸 | scroll-driven リビール（頁送り） | 維持＋**スクロール駆動の 3D 組み上げ**と**キネティック字送り**へ拡張 |
| 空間 | 3D Proun は Hero 背面の脇役 | **Hero フルビューポートの主役**（scroll で軸測回転・組み上げ） |
| 色 | 5 色・ライト単一 | **5 色厳守のまま**「反転ポスター」= **ダークモード追加**（OS 追従＋手動） |
| 装飾 | Phaser 2D タイル + 3D 脇役 | **Phaser 退役**。3D（Hero）+ CSS/SVG 幾何に一本化して軽量・一貫化 |
| ナビ | 上部の水平リンク列 | **地図/索引ナビ**（常設番号列 01–07 ＋ フル画面地図） |
| 遊び | Phaser の Issue→実装エージェント | **CSS/3D の署名インタラクション**「COMPOSE AN ISSUE」へ再発明 |
| 導入 | なし | **ポスター組み上げイントロ**を新設（初回のみ・PRM で即完成） |

**不変の禁則**（現行から継続・全項目で死守）:
角丸なし（矩形の角丸め禁止／真円は一次語彙で可）・ソフトシャドウ／glassmorphism 禁止・
バウンス／オーバーシュート easing 禁止（**モーションは `linear` / `steps()` の機械的なもののみ**）・
**パレット外の色ゼロ**（可変フォントも色も足さない）。

---

## 2. カラー — 5 色厳守 ＋ ダークモード（反転ポスター）

### 2.1 方針

- **新色ゼロ**。`tailwind.config.mjs` の `constructivist.red/black/cream/gray/darkgray` の 5 hex が唯一の出典。
- **ライト既定**。手動トグル（`localStorage`）＋ OS 追従（`prefers-color-scheme`）。
  未指定時は OS に従い、トグル操作で上書き・記憶する。
- 実装は **セマンティック CSS 変数**を `global.css` に定義し、`html[data-theme]` で hex 割当を反転する。
  **hex 値自体は変えない — 役割 → hex の対応だけを反転する**（トークン純度を保つ）。
- ダーク = **反転ポスター**: 黒地・クリーム文字。**赤は大要素・図形・帯・大テキストに限定**
  （red 小テキスト禁止は red on black 3.48:1 のため継続）。

### 2.2 セクション背景の扱い（ダークで ABAB を潰さない）

ライトは cream/black の ABAB。ダークは**大面積の cream 反転を作らない**（それは反転ポスターの意図に反する）。
ダークは **black ↔ darkgray の微差 2 トーン**で seam（継ぎ目）を残し、赤い罫線・番号・マーキー・
**明块（bright block）**でリズムを立てる。

| セクション | ライト bg | ダーク bg |
|---|---|---|
| Hero | black | black |
| About / AI / Portfolio（"明"側） | cream | **darkgray** |
| Skills / Career / Contact（"暗"側） | black | black |

> darkgray `#3D3A37` と black `#1A1A1A` の差は小さいが、境界は赤罫線・番号・マーキーが明示する。
> 「反転ポスターは黒基調」という原則を守るための選択。

### 2.3 セマンティックトークン対応表（frontend が `global.css` に定義）

CSS 変数名は提案。すべて 5 hex 内。`--c-accent`（赤）は常に赤で不変。

| 変数 | 役割 | ライト | ダーク | 備考 |
|---|---|---|---|---|
| `--c-page` | ページ地（明側 bg） | cream | darkgray | 本文セクション地 |
| `--c-ink` | 本文主テキスト（page 上） | black | cream | 15.37 / 9.98 |
| `--c-ink-muted` | 副テキスト（page 上） | darkgray | **cream** | ライト 9.98。**ダークは gray/darkgray=3.13 が NG のため cream に寄せ、サイズ/太さで階層化** |
| `--c-line` | 罫線・枠（page 上） | black | cream | 15.37 / 9.98 |
| `--c-field` | 暗側セクション bg | black | black | 不変 |
| `--c-field-ink` | 暗側 主テキスト | cream | cream | 15.37 |
| `--c-field-muted` | 暗側 副テキスト | gray | gray | **4.82（黒地でのみ gray 可）** |
| `--c-block` | 明块（反転ブロック）bg | black | cream | ライト=黒块 / ダーク=クリーム块 |
| `--c-block-ink` | 明块 主テキスト | cream | black | 15.37 |
| `--c-block-muted` | 明块 副テキスト | gray | darkgray | 黒块=gray(4.82) / クリーム块=darkgray(9.98) |
| `--c-accent` | 赤（図形・帯・大テキスト・罫線） | red | red | 不変。**小テキストには使わない** |

### 2.4 ダークモード コントラスト再検証（全ペア AA）

AA: 通常 4.5:1 / 大（24px+ または 18.66px+ bold）3:1 / 非テキスト図形 3:1。

| ペア（ダークで発生） | 比 | 通常 | 大/図形 | 判定 |
|---|---|---|---|---|
| cream on black（本文・見出し） | 15.37 | OK | OK | ✅ |
| gray on black（副テキスト） | 4.82 | OK | OK | ✅ |
| cream on darkgray（明側 本文・見出し） | 9.98 | OK | OK | ✅ |
| black on cream（クリーム明块 テキスト） | 15.37 | OK | OK | ✅ |
| darkgray on cream（クリーム明块 副） | 9.98 | OK | OK | ✅ |
| red on black（図形・罫線・番号列の現在マーク） | 3.48 | — | 図形 OK | ✅（非テキスト） |
| red on black（大テキスト・CTA 見出し） | 3.48 | NG | 大 OK | ✅（**24px+ のみ**） |
| cream on red（CTA/マーキー 大テキスト） | 4.42 | NG | 大 OK | ✅（**24px+ のみ**） |
| red 小テキスト（あらゆる地） | 3.48/4.42 | NG | — | ❌ **禁止（継続）** |
| gray on darkgray（副テキスト） | 3.13 | NG | 大 OK | ⚠️ **通常テキスト禁止** → 明側の副は cream（`--c-ink-muted`）で回避 |
| gray on red | 1.39 | NG | NG | ❌ **禁止（継続）** |

**帰結（ダーク固有ルール）**:
- 明側セクション（darkgray 地）の**副テキストは gray を使わない**（3.13 NG）。cream に寄せてサイズ/太さで階層。
- 暗側セクション（black 地）の副テキストは gray 可（4.82）。
- 赤の小テキストはライト同様どの地でも禁止。赤は「面・帯・罫線・大テキスト」に限る。
- クリーム明块の内部は black（主）/ darkgray（副）で従来の黒パネルの役割が反転して成立。

### 2.5 実装メモ（frontend）

- `<html>` に `data-theme="light|dark"`。**FOUC 防止のインラインスクリプト**を `<head>` 先頭に置く
  （`localStorage.theme` → なければ `matchMedia('(prefers-color-scheme: dark)')`）。
- トグルは**幾何学スイッチ**: 赤い正方形が左（LIGHT）↔ 右（DARK）へ `steps(1)` で瞬間移動する
  2 状態スイッチ（角丸なし・スライドの補間なし＝機械的）。`aria-pressed` と `aria-label="配色モード切替"`。
- `prefers-color-scheme` の変化を監視し、**手動上書きが無いとき**のみ追従。
- grain（T4）は**ライトの明側のみ**。ダークは grain 無し（黒インクのベタ＝反転ポスターの物質感）。
- `::selection` はライト red/cream、ダークも red/cream で不変（cream on red 大扱いで可）。
- 既存の `bg-constructivist-*` 直書きは段階的にセマンティック変数へ寄せる（Tailwind 任意値
  `bg-[var(--c-page)]` かユーティリティ化）。**新規の色ユーティリティ追加はしない**。

---

## 3. 実験的ナビ — 地図/索引（常設番号列 ＋ フル画面地図）

現行の上部水平リンク列（ABOUT … CONTACT）を **地図/索引ナビ**へ置換する（両立型）。

### 3.1 常設の番号列（常時表示）

- **右端に固定の縦カラム**（`position: fixed; right: 0; top: 50%; translateY(-50%)`）。
  幅 **40px**（モバイル 36px）。`01`〜`07` を JetBrains Mono `text-xs tracking-widest` で縦に並べる。
- 各番号は**アンカーリンク**（`<nav aria-label="セクション索引">` 内の `<a href="#hero">…</a>`）。
  Hero を **01** に昇格（現行は Hero=装飾 01・ナビ 6 項目 → **索引は 7 項目 01–07**）。
- 現在地: `IntersectionObserver`（現行 T6c を流用）で現在セクションの番号を
  **赤い実心正方形（`8px`）＋ `aria-current="page"`** で示す。他は数字のみ（`--c-field-muted` 相当）。
  色は地に依存せず、カラム自体を半透明の暗パネル（`--c-field` の 85%）に載せて可読性を固定。
- **番号列はスクロール進捗の触覚も兼ねる**: 現在番号の左に `2px` の赤インジケータ（T6a 進捗の縮約）。
- reduced-motion: 変化なし（状態表示・アニメではない）。モバイル: カラムは残すが、
  タップで 3.2 のフル地図を開く導線を主にする。

### 3.2 フル画面「地図」インデックス（展開）

- トリガ: 上部バーの **`INDEX ▨` ボタン**、または番号列クリック。
- 展開形は**縦リストではなく空間的なポスター地図**: フル `100vw×100vh` オーバーレイ（`--c-field` 地）に、
  7 セクションを **12 列グリッド上に非対称配置した大プレート**で置く（破壊的グリッドの縮図）。
  各プレート = `番号(mono)` ＋ `セクション名(Bebas 極大)` ＋ 幾何グリフ（赤四角/円/斜線）。
  現在地プレートは赤で塗り、他は枠のみ。プレート hover で版ずれ（T3）。
  > **frontend 実装メモ（a11y）**: 現在地プレート（赤塗り）は cream on red のため、AA を満たす**大テキストの
  > セクション名のみ**を残し、**小さな番号(mono)は非表示**にする（cream on red 小 4.42 は AA 未達）。番号は番号列が担う。
  > INDEX / CLOSE ボタンの hover は赤ベタ塗りではなく misprint（赤の box-shadow 版ずれ）にして、cream on red 小の発生を避ける。
- レイアウト数値（デスクトップ 12 列）: プレートは 3–5 列幅、行をまたいで**意図的にオフセット**
  （例 01=col1–4/row1、02=col7–11/row1、03=col2–6/row2 … 各行で開始列を ±2 ずらす）。
  モバイルは 2 列の千鳥（各行で左右交互にインデント `1rem`）。
- トランジション: 番号列側の縁から `clip-path: inset()` を **`steps(4)`・240ms・linear** で開く
  **機械シャッター**（フェードしない）。閉じるは逆。プレート群は `steps` で 40ms ずつ差し込み。
- a11y: オーバーレイは `role="dialog" aria-modal="true" aria-label="セクション索引"`。
  開いたら**フォーカストラップ**、`Esc` で閉じ、開閉ボタンにフォーカス復帰。背景 `inert`。
  プレートは通常のリンク（キーボード到達可）。装飾グリフは `aria-hidden`。
- **reduced-motion**: シャッターも差し込みもなし。オーバーレイは**即時表示**（`clip-path` 全開・opacity 1）。

### 3.3 上部バー（縮約）

- 高さ 56px、`--c-field` 地。左 `H.NIGO`（Bebas）／中央 現在地ラベル `03 — SKILLS`（mono+Bebas、
  `aria-hidden`・番号列が情報を担う）／右 `INDEX ▨` ＋ 配色トグル。
- 水平リンク列（現行の 6 リンク）は**地図に統合して撤去**（実験的ナビの本体は地図＝索引）。
- モバイルのハンバーガーは `INDEX` ボタンに置換（同じフル地図を開く）。

---

## 4. 破壊的グリッド — 重なり・はみ出し・回転（緩急つき）

**12 列**を基準に、セクションを **loud（破壊）/ mid（部分破壊）/ calm（整列）** の 3 段で運用する。
情報密度が高い所は読める整列を死守し、掴み・締めは大胆に崩す。

### 4.1 セクションごとの可読性 強弱表

| セクション | 段階 | 破壊の内容 | 読みやすさの担保 |
|---|---|---|---|
| Hero | **loud** | フル3D・極大 H1 が右へはみ出し・要素の重なり | 本文（役割・説明）は左カラムに整列 |
| About | **calm** | 見出しのみ左へ bleed | dl・本文は 12 列内・measure ≤ 68ch で整列 |
| Skills | **calm** | 見出しのみ bleed・番号だけ回転 | スキルバー・%・凡例は厳密整列（データは崩さない） |
| （マーキー） | loud | 全幅赤帯（現行 T7 維持） | 純装飾・情報なし |
| AI（署名） | **mid→loud** | 署名インタラクションの組み上げ領域は自由配置 | ツール説明カードは 2 列グリッドで整列 |
| Career | **calm** | 見出し bleed・縦軸装飾の重なり | 年表（縦ライン・マーカー・技術タグ）は厳密整列 |
| Portfolio | **mid** | カードを ±1 セル食い違わせ・赤块がカード角に食い込む | カード本文・タグは各カード内で整列 |
| Contact | **loud** | 極大 CONTACT が中央から破断・大円と赤块の重なり | CTA ボタンは中央整列・単独で明快 |

### 4.2 破壊の数値（トークン化して frontend に渡す）

- **見出し bleed（calm/mid でも許容）**: 見出しコンテナに
  `margin-left: clamp(-4rem, -1rem - 2vw, -0.5rem)`。極大語はセクションの `overflow: hidden` で右端切れ可。
- **要素オフセット（mid）**: 隣接ブロックを `translate(clamp(-1.5rem,-3vw,-0.5rem), clamp(0.5rem,1.5vw,1.5rem))` で食い違わせる。
  重なり量は要素幅の **10–20%** を上限。
- **回転（装飾块のみ）**: 赤/黒の正方形・帯は `rotate(-12deg 〜 12deg)`。**テキストブロックは回転しない**
  （読めなくなる）。loud 見出しの傾きは §5 の skew（≤10°）に限定。
- **重なりの z**: 装飾块は本文より下（`z < 10`）で重ね、**テキストの可読部に被せない**。
  赤块が見出しに被る場合は**文字の後ろ**（下 z）に置き、コントラストを侵さない。
- **calm セクションの measure**: 本文段落は `max-width: 68ch`、左揃え、オフセット 0。データ表示
  （スキルバー・年表・凡例）は**一切崩さない**（読みやすさ最優先）。
- モバイル（< 640px）: loud の破壊は**縮退**（bleed は `-0.5rem` 上限、回転は ±6° 上限、
  はみ出しは overflow で切るのみ）。構図が崩れて読めなくなることを防ぐ。

---

## 5. キネティック・タイポ — 手法の選択と数値

### 5.1 手法の決定: **Bebas + transform（可変フォントは採らない）**

ブリーフの裁量に基づく**デザイナー判断**。理由:

1. **構成主義のキネティシズムは「字形の太さ補間」ではなく「幾何学的な変形・構図」**（skew の斜線、
   letter-spacing の伸縮、シャッター状のマスク、スケール跳躍、機械的な字送り）。可変フォントの
   weight/width モーフは**滑らかで有機的**に読まれやすく、`linear/steps` の機械性・リトグラフの即物性と相性が悪い。
2. **確立した Bebas のアイデンティティを薄めない**。フォントを 1 つ足すと、ロード負荷とタイポの
   一貫性の両方でリスク。**5 色厳守と同じ精神で「フェイスも増やさない」**。
3. **transform / clip-path はコンポジタ（GPU）で走り安価** — 3D と併存する perf 予算に有利。
   可変軸アニメはレイアウト/ペイントを誘発しがちで重い。

結論: **可変フォントは追加しない**。キネティックは Bebas への transform/mask で表現する。

### 5.2 手法カタログと数値

| 技法 | 用途 | 数値 | easing |
|---|---|---|---|
| **letter-spacing 伸縮** | loud 見出しがスクロールで「広がる」 | `tracking` 0.02em → 0.14em（entry→cover） | linear（scroll） |
| **skewX 斜断** | loud 見出し（Hero/Contact）の斜線力線 | `skewX(-8deg)`（最大 -10deg）。大文字・大サイズのみ | 静的 or steps |
| **シャッター・マスク・リビール** | 見出しを赤块が横切って刷り出す | `clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)`、`steps(6)`・~360ms | steps |
| **スケール跳躍** | Hero H1 のスクロール・ピン | `scale(0.96)` → `scale(1)`（scroll 0→1）＋ letter-spacing 伸縮 | linear |
| **字送りパララックス** | 極大語が背景で横流れ | `translateX(0 → clamp(-6vw,-8vw,-4vw))`（scroll scrub） | linear |
| **版ずれ（既存 T3）** | hover の 2 色刷りズレ | `text-shadow: 2px 2px 0 red`（維持） | 0s（即時） |

- **適用範囲**: 極大 Bebas 見出し（H1・loud h2）のみ。**本文・データ・ナビ小文字には掛けない**。
- **可読性**: 変形中も**最終状態は必ず正立・可読**。skew は静的装飾か、scroll 完了時に 0 へ戻す。
  clip マスクは**リビール完了後は全文表示**（途中状態で固定しない — Firefox/PRM は最終状態）。
- **calm セクション**は現行 `reveal-heading`（translate 対角・linear）を**そのまま維持**（キネティック上乗せなし）。
  loud セクションのみ §5.2 を追加適用する。
- **@supports / PRM ゲート**: scroll 連動の伸縮・スケール・パララックスは
  `@media (prefers-reduced-motion: no-preference)` かつ `@supports (animation-timeline: view())` の**内側**。
  非対応/PRM は**最終状態（正立・全字・既定 tracking）を静的表示**。

---

## 6. 没入 3D ヒーロー — スクロール駆動の主役

現行の Three.js Proun（`ProunCanvas`・`proun-3d.spec.md`）を **Hero 背面の脇役 → フルビューポート主役**へ昇格。

### 6.1 構造とスクロール挙動

- Hero を **`height: 250vh` の縦長ラッパー**にし、内側の 3D キャンバス＋本文を **`position: sticky; top: 0; height: 100vh`** で固定。
  スクロール進捗 `p = 0→1`（ラッパー通過）で以下を駆動:
  - **軸測回転**: Proun の yaw `0deg → 28deg`、pitch `0deg → -6deg`（軸測＝等角の範囲を保つ）。
  - **組み上げ（assemble）**: 赤块・黒块・クリーム円・斜梁が `p=0` で分散 → `p∈[0,0.6]` で定位置へ集合
    （各要素 `translateZ`/位置を scrub、`steps` 感のある離散寄りでも可）。
  - **ドリー**: `camera.z` を軽く寄せ（`p∈[0.6,1]`）、最後に**赤い主役正方形が画面を占有**して次セクションへ受け渡す。
  - **キネティック H1**: `H.NIGO` は §5 の letter-spacing 伸縮＋scale ピン（`p∈[0,0.4]`）。
- **他セクションは軽量維持**: 3D は Hero のみ。他は CSS/SVG 幾何装飾（§8）に留めて perf バランスを取る。

### 6.2 実装・perf・a11y

- **遅延ロード**: `ProunCanvas` は `client:visible`、Three.js は動的 import（初期バンドルに載せない）。
- **スクロール連動**: 可能なら **`ScrollTimeline`（WAAPI）** で 3D パラメータを駆動、非対応は
  `IntersectionObserver` + `requestAnimationFrame` で `scrollY` を読み取る（メインスレッド節約・throttle）。
  DPR 上限（モバイル電池保護）は既存方針を踏襲。
- **フォールバック**:
  - WebGL 非対応/低性能: 既存の**静的 SVG 軸測 Proun**（最終組み上げ状態）を全画面表示。
  - **reduced-motion**: スクロール連動を**無効化**し、`p=1` 相当の**完成した軸測 Proun を静止表示**。
    H1 は既定 tracking の正立。Hero は単一 100vh の静的ポスターとして成立。
- a11y: キャンバスは `aria-hidden`。本文（H1・役割・説明）は DOM 上に実テキストで存在し、
  3D の有無に関わらず読み上げ・コントラスト（cream/black 15.37、赤帯 cream 大 4.42）が成立。
- **sticky の落とし穴**: `250vh` ラッパーの分だけスクロール量が増える。番号列・進捗の
  現在地判定（IntersectionObserver rootMargin）を Hero の長さに合わせて調整すること。

---

## 7. イントロ — ポスター組み上げ演出（初回のみ）

### 7.1 シーケンスとタイミング（総尺 ≈ 1.4s・機械的）

`easing` は全カット `steps()` / `linear`。フェード/バウンス禁止。フル画面オーバーレイ（`--c-field` 地）。

| 区間 | 内容 | 数値 |
|---|---|---|
| 0–300ms | 赤い実心正方形が左からスナップイン＋黒帯が上から落ちる | `translateX(-40vw→0)` `steps(4)` / `translateY(-100%→0)` `steps(3)` |
| 300–650ms | クリーム面が横ワイプ、`H.NIGO` を 1 字ずつスナップ | `clip-path inset` `steps(5)` / 各字 `steps(1)`・40ms stagger |
| 650–1050ms | 円・斜線・黒块が定位置へ集合（＝ポスター完成） | 各要素 `translate` `steps(4)`・60ms stagger |
| 1050–1400ms | オーバーレイが上へシャッター退場、実 Hero を露出 | `clip-path inset(0 0 100% 0)` `steps(6)`・linear |

### 7.2 制御・a11y

- **初回のみ**: `sessionStorage.introSeen` で 1 セッション 1 回。再訪・同一セッション遷移では出さない。
- **スキップ**: 右下に `SKIP ▸`（mono・キーボード到達可）。押下で即 `p=1`（実 Hero へ）。
  最初の任意キー/クリックでもスキップ可。
- **フォーカス**: イントロ中は body を `inert`、退場後に H1 相当へフォーカスを渡さない（スクロール位置は最上部）。
- **reduced-motion**: **イントロを実行しない**。オーバーレイは初回から非表示（`p=1` 即完成）。
  `sessionStorage` も既読扱いにし、以後も出さない。
- **JS 無効**: オーバーレイは既定 `display:none`（JS が付与して開始）。無効時は素の Hero が出るだけ。

---

## 8. 装飾の一本化 — Phaser 退役、3D + CSS/SVG へ

- **Phaser 2D レイヤー（`ConstructivistCanvas`・`decoration.spec.md`）は退役**。
  初期 JS を大きく食う（Phaser ≈ 343kB gzip の別チャンク）ため、**Hero の 3D 主役**と
  **他セクションの CSS/SVG 幾何装飾**に一本化して軽量・一貫化する（ブリーフ #9）。
- 置換方針:
  - Hero: 6 章のフル3D Proun。
  - 他セクション: 既存の CSS 幾何（赤縦バー・大円・回転赤块・ダイヤモンドマーカー・斜線）を
    **破壊的グリッド（§4）の語彙で強化**。必要なら軽量 `SectionAccent`（軸測 3D 脇役・`proun-3d.spec` 系）を
    **少数**維持（perf を見て frontend が判断）。新たな重い装飾は足さない。
  - 署名の遊び（Phaser の Issue→実装）は §9 の CSS/3D 署名インタラクションへ**再発明**して継承。
- `decoration.spec.md` は**歴史的記録として残す**（本 spec が Hero/装飾方針の後継）。
  frontend は `ConstructivistCanvas` の各セクション設置を撤去してよい（受入で JS 削減を確認）。

---

## 9. 署名インタラクション — 「COMPOSE AN ISSUE」（**撤回・不採用**）

> **ステータス: 撤回（ユーザー判断で削除）**。一度実装（`IssueForge.astro`）したが、履歴書サイトには過剰との判断で
> **除去**した。AI セクションの見せ場は「ツール説明カード＋INTEREST & FOCUS」で十分成立する。
> 以下は経緯の記録として残す（実装は存在しない）。Hero（フル3D・§6）が引き続き第一の見せ場を担う。

### 9.1 見せ場（署名）セクションの選定 — **AI-POWERED DEV**

**デザイナー判断**: このサイトの核アイデンティティは **「Issue 起票 → AI が実装 → PR」= 仕様駆動 / AI 駆動開発**。
署名の遊びはこの核が語られる **AI セクション**に置くのが最も意味的に強い。
役割分担を明確化する:

- **Hero = 没入・第一印象の見せ場**（フル3D。§6）。
- **AI = 署名インタラクションの見せ場**（「工房 / FORGE」。訪問者が Issue を"起票"すると幾何が組み上がる）。

### 9.2 インタラクション仕様

- AI セクション内に **「OPEN AN ISSUE」ボタン**（または `12` 列の空きグリッド）を置く。
  クリック/タップ/Enter で **1 件の Issue を起票** → 赤块・黒块・クリーム円・斜梁が
  `steps()` で飛来し、**グリッドに「実装（＝スナップ配置）」されて 1 つの構成主義コンポジションが build** される。
  各起票でカウンタ `ISSUE #01, #02 …`（mono）が進み、既存構成が「リファクタ」して組み替わる
  （decoration.spec の Issue→実装エージェントの CSS/3D 版）。
- モーション: 飛来 `translate` `steps(4)`・配置 `steps(1)`。回転は装飾块に ±12°。**線形・機械的**。
- 上限: 数手で「完成」し、以後はワンクリックで**新しい構図に再構成**（無限に増やさない・過剰化しない）。
- **reduced-motion**: 飛来アニメなし。クリックで**最終配置を即時反映**（結果は同じ、動きを消す）。
- **a11y**:
  - ボタンは実 `<button>`（`aria-label="Issue を起票して構成を組み立てる"`）。キーボード操作可。
  - 生成される幾何は **純装飾（`aria-hidden`）**。
  - 状態は `aria-live="polite"` の視覚非表示テキストで簡潔に通知（例:「Issue #3 を実装しました」）。
  - 遊びは**進行の必須要素ではない**（触らなくても AI セクションの情報は完全に読める）。
- コントラスト: 生成块は figure（非テキスト 3:1）。カウンタ mono は地に応じて
  `--c-field-muted`（gray/black 4.82）or `--c-ink`（cream）。**赤の小テキストにしない**。

---

## 10. 幾何学カスタムカーソル ＋ 強めのスクロール演出

### 10.1 カーソル

- **`pointer: fine` の環境のみ**（`matchMedia('(pointer: fine)')`）。タッチ/粗ポインタは既定カーソル。
- 形状: **赤い十字（クロスヘア）** 既定 `20×20px`（線 2px・赤）＋視認用に `1px` cream の縁取り
  （黒地/クリーム地の両方で見えるようにする。blend は使わない＝パレット純度維持）。
  - インタラクティブ要素上: **赤い実心正方形 `16px`**（十字 → 塗り四角へ `steps(1)` で瞬間変形）。
  - 大ターゲット（地図プレート・CTA・3D 領域）: **赤い中空正方形 `40px`（枠 2px）**＝照準拡大。
- 追従: `requestAnimationFrame` で lerp（係数 0.2 程度）。ネイティブカーソルは `cursor: none`（custom 有効時のみ）。
- **reduced-motion**: lerp 追従を切って**ポインタに即座スナップ**、状態変形は `steps` で瞬時（transition なし）。
  形状は出す（動きだけ抑える）。
- **JS 無効/カーソル要素失敗時**: ネイティブカーソルを残す（`cursor: none` は JS 成功後にのみ付与）。
- z: 最前面（`z-index` 最大）・`pointer-events: none`・`aria-hidden`。

### 10.2 スクロール演出（強め・ただし機械的）

- 進捗: 番号列の赤インジケータ（§3.1）＋既存 T6a 進捗バーを維持（重複しないよう、
  番号列に集約 or 上端バーのどちらかに一本化 — frontend が視覚検証で選択。既定は**番号列に集約**）。
- セクション遷移: calm 見出しは現行 `reveal-heading`、loud 見出しは §5 のキネティック、Hero は §6 の 3D。
- **すべて `linear` / `steps`**。慣性スクロール（smooth-scroll ライブラリ）は**入れない**
  （バウンス/イージングの誘惑を断つ）。`scroll-behavior: smooth` はアンカー移動のみ（PRM で auto）。

---

## 11. a11y 制約まとめ（拘束条件・死守）

- **コントラスト行列（a11y.spec）を全新規要素・全モードで遵守**。ダークは §2.4 の再検証表がゲート。
  - red 文字は 24px+（or 18.66px+ bold）のみ。**red 小テキスト禁止（両モード）**。
  - ライト: cream 地の小テキストは darkgray。black 地は gray 可。
  - ダーク: black 地の小テキストは gray 可。**darkgray 地の小テキストは gray 不可 → cream**。
  - red 帯上は cream 大テキストのみ。**gray on red 禁止（両モード）**。
- **純装飾は `aria-hidden` + `pointer-events:none`**: 3D キャンバス・幾何块・番号列の赤マーク・
  カーソル・キネティック装飾・grain・マーキー・署名で生成される幾何。
  例外（情報として公開）: 番号列リンクの `aria-current`、地図 dialog、署名ボタンと `aria-live`。
- **prefers-reduced-motion**: イントロ（非実行）・3D スクロール（静止完成）・キネティックタイポ（静的最終状態）・
  地図シャッター（即時）・カーソル（追従なし・瞬時変形）・署名（即時配置）・マーキー（静止帯）・
  scroll-driven リビール（静的最終）を**すべて静的フォールバック**で定義（本 spec 各章に明記）。
- **Lighthouse A11y 95+ / WCAG AA を維持**。3D/モーションの perf 低下は許容しつつ最適化
  （遅延ロード・island 化・PRM 軽量パス・DPR 上限）。
- **フォーカス**: 既存 `:focus-visible`（cream 地=red / 黒地=cream）を維持し、**ダークでも視認**するよう
  リング色をモードで反転（黒地=cream / cream 明块=red）。地図 dialog はフォーカストラップ＋Esc。
- スキップリンク（`main` へ）を追加推奨（地図と番号列が増えるためキーボード動線を短縮）。

---

## 12. `@supports` / プログレッシブエンハンスメント ゲート方針

| 機能 | ゲート | 非対応/PRM 時の見え |
|---|---|---|
| ダーク配色（CSS 変数） | 不要（全ブラウザ） | ライト or OS 追従で成立 |
| キネティック見出し（scroll 連動） | `@supports (animation-timeline: view())` + PRM no-pref | 静的最終状態（正立・全字・既定 tracking） |
| calm リビール（既存） | 同上（現行維持） | 静的最終状態 |
| 進捗（scroll timeline） | `@supports (animation-timeline: scroll())` + PRM | 番号列の現在地表示のみ（バーは非表示） |
| 3D ヒーロー scroll | `ScrollTimeline` 検出 → 無ければ rAF。WebGL 検出 | 静的 SVG 完成 Proun / PRM も静止完成 |
| 地図シャッター（clip-path steps） | PRM no-pref（clip-path は Baseline） | 即時表示（wipe なし） |
| イントロ | JS ＋ sessionStorage ＋ PRM no-pref | 実行しない（素の Hero） |
| カーソル | JS ＋ `(pointer: fine)` ＋（PRM で追従無効） | ネイティブカーソル |
| 署名インタラクション | JS（プログレッシブ） | 触らなくても情報は完全。PRM は即時配置 |

**原則（現行から継続・厳守）**: 初期状態を隠す宣言（`opacity:0` / `scaleX(0)` / `clip-path` 閉）は
**必ずゲートの内側**。ゲート外・非対応・PRM で**コンテンツが不可視のまま残る事故を作らない**。

---

## 13. 既存資産（PR #11 / trends-2026-refresh.spec）との関係

| 資産 | 関係 | 内容 |
|---|---|---|
| 流体タイポ `display/heading-fluid` | **維持＋発展** | 土台のまま、loud にキネティック transform を上乗せ |
| セクション番号 `02 / 07`（mono） | **発展** | 常設番号列 01–07 の情報源へ昇格。セクション内表示も維持可 |
| scroll-driven リビール `reveal-heading/rule` | **維持（calm）＋派生（loud）** | calm はそのまま、loud はキネティック版を追加 |
| 進捗バー（scroll timeline） | **維持 or 集約** | 番号列インジケータへ集約（重複回避、frontend が視覚判断） |
| 版ずれ `misprint-*` | **維持** | 両モードで有効。色は red/black でモード不変（再検証済） |
| 紙 grain | **維持（ライト明側のみ）** | ダークは無し（黒インクのベタ） |
| マーキー（T7 赤帯） | **維持** | Skills/AI 境界に 1 本。両モードで cream on red 大 |
| ナビ現在地（IntersectionObserver / aria-current） | **維持＋発展** | 番号列と地図の現在地表示を駆動 |
| フォント読込（preconnect + link, F-5） | **維持** | 可変フォント追加なし＝ウェイト構成不変 |
| Phaser 装飾（decoration.spec） | **置換/退役** | 3D + CSS/SVG へ一本化（§8） |
| 3D Proun（proun-3d.spec） | **昇格** | 脇役 → フルビューポート主役（§6） |
| a11y.spec コントラスト行列 | **拡張適用** | ダークの全ペアを §2.4 で再検証済み |

> `trends-2026-refresh.spec` の「ダークモード＝今回スコープ外」は**当時の記録**。本 spec がその後継として
> ダークを 5 色内で解禁する。**新規の色・フォント・重い依存は増やさない**方針は完全に踏襲。

---

## 14. トークン / 設定 追加提案（`tailwind.config.mjs` / `global.css`）

- **色トークン追加ゼロ**。ダークは `global.css` の**セマンティック CSS 変数**（§2.3）で実現。
  Tailwind には `colors` を足さない（既存 `constructivist.*` の 5 色が変数の値供給源）。
- 既存 `fontSize.display-fluid / heading-fluid`（clamp）は維持。**フォント追加なし**。
- 追加してよいユーティリティ（色ではない）: セマンティック変数参照用の任意値
  （`text-[var(--c-ink)]` 等）か、`@layer utilities` の薄いエイリアス。**新色は不可**。
- 破壊的グリッドのオフセット/回転は §4.2 の clamp 値を**ユーティリティ or インライン**で。任意値の乱造は避け、
  再利用するものは `@layer components`（例 `.bleed-heading`, `.destructive-offset`）に集約。

---

## 15. 受入条件

### カラー / ダークモード
- [x] 5 色以外の hex がコード全体でゼロ（可変フォント・新色の追加なし）。
      ― デザイン色は `constructivist.*` の 5 hex のみ。`global.css` のセマンティック変数は theme() 参照。
      （既存の GitHub 言語分布バー `langColors` は本 spec 以前からのデータ可視化色で design 色ではない・追加なし）
- [x] `html[data-theme]` でライト↔ダークが**セマンティック変数の反転のみ**で切り替わる（hex 定義は不変）。
      ― 実機で computed 値を確認: light page=cream/ink=black/block=black、dark page=darkgray/ink=cream/block=cream（すべて 5 hex 内）。
- [x] OS 追従（`prefers-color-scheme`）＋手動トグル（`localStorage`）＋FOUC 防止インラインスクリプトが動く。
      ― `<head>` インライン初期化＋Header の幾何スイッチ（steps(1)）＋OS 変化監視（未上書き時のみ追従）を実機確認。
- [x] **ダークの全テキスト/地ペアが §2.4 の再検証表どおり AA**（darkgray 地の gray 小テキストが存在しない・
      red 小テキストが存在しない・gray on red が存在しない）。
      ― 明側副テキストは `--c-ink-muted`（ライト darkgray9.98 / ダーク cream9.98）へ寄せた。地図現在プレートの小番号は非表示（cream on red 小 4.42 回避）。
- [x] grain はライト明側のみ、ダークで無効。マーキー/CTA の cream on red は両モードで大テキスト扱い。
      ― `html[data-theme='dark'] .grain-overlay{display:none}`。マーキー text-3xl・CTA text-xl は大テキスト。

### 実験的ナビ（地図/索引）
- [x] 常設の番号列 01–07 が固定表示され、現在地が赤四角＋`aria-current="page"` で示される（両モード視認）。
      ― 右端固定 rail（半透明 field パネル）。IntersectionObserver で現在地連動を実機確認（hero→…→contact）。
- [x] `INDEX` で `role="dialog" aria-modal` のフル画面地図が開き、フォーカストラップ・Esc・復帰が動く。
      ― 開くと CLOSE にフォーカス、Tab 巡回、Esc で閉じて INDEX ボタンへ復帰。背景は `inert`＋body スクロールロック。
- [x] 開閉は clip-path `steps` シャッター、**PRM では即時表示**。地図プレートはキーボード到達可・装飾は aria-hidden。
      ― PRM で 60ms 後に visibility:visible・全開を確認。プレートは実リンク、glyph は aria-hidden。
- [x] 上部の旧・水平リンク列が撤去され、モバイルは `INDEX` が同じ地図を開く。
      ― Header の 6 リンク列＋ハンバーガーを撤去。375px でも INDEX が同一地図を開くことを確認。

### 破壊的グリッド
- [x] §4.1 の強弱表どおり loud/mid/calm が実装され、**データ表示（スキルバー・年表・凡例）は崩れず整列**。
      ― About/Skills/Career=calm（見出し bleed のみ・データ整列）、AI=mid→loud（bleed＋赤块＋キネティック）、
      Portfolio=mid、Contact=loud（極大＋シャッター）。※ Portfolio の「カード ±1 セル食い違い」は PR#11 の
      連結ボーダー・データグリッドの可読性を守るため、赤块の角食い込み＋見出し bleed に縮約（§4.1「カード本文・タグは
      各カード内で整列」を優先した frontend 判断）。
- [x] 重なり/回転は装飾块に限定され、**テキストの可読部に被らず**コントラストを侵さない（装飾块は `z<10`・aria-hidden・
      本文 z-10 の背後。テキストブロックは回転させず、Skills の番号のみ回転＝aria-hidden）。
- [x] モバイルで破壊が縮退し、構図が崩れて読めなくなる箇所がない（`bleed-heading` は -0.5rem 上限、装飾块は縮小）。

### キネティックタイポ
- [x] 可変フォントを**追加していない**（Bebas + transform で実現。フォント構成は不変）。
- [x] loud 見出しに letter-spacing 伸縮 / skew / シャッターマスク等が効き、**最終状態は正立・全字・可読**。
      ― Hero H1=letter-spacing 伸縮＋scale ピン、ROLE=skewX（内側逆 skew で字は正立）、AI h2=letter-spacing 伸縮、
      Contact h2=clip-path シャッター（steps(6)）。
- [x] scroll 連動は `@supports (animation-timeline: view())` + PRM 内。非対応/PRM で静的最終状態。
      ― H1 は JS の rAF が供給する `--hero-p` で駆動し、既定値（未設定/PRM/JS 無効）は正立・可読の静的状態。
- [x] calm 見出しは現行 reveal のまま（キネティック上乗せなし。About/Skills/Career は bleed のみ）。

### 没入 3D ヒーロー
- [x] Hero がスクロール駆動でフルビューポートの主役（軸測回転・組み上げ・H1 ピン）。他セクションは軽量。
      ― `hero-wrap`=250vh（モバイル 200vh）／`hero-stick`=sticky 100vh。p∈[0,0.6] で組み上げ・[0.6,1] でドリー、
      yaw 0→28°・pitch 0→-6°。Header の IntersectionObserver rootMargin を `-35% 0px -55%` に調整（§6.2 の落とし穴）。
- [x] Three.js は遅延ロード（初期バンドルに載らない）。WebGL 非対応は静的 SVG 完成 Proun。
      ― `ProunCanvas` は `client:visible`＋`import('three')`。three は 705kB の別チャンクで初期バンドル外（build ログ確認）。
- [x] **PRM で 3D スクロールが無効化され、完成した軸測 Proun を静止表示**（Hero は 100vh 静的ポスターで成立）。
      ― PRM で `ProunCanvas` は静的 SVG フォールバック、CSS が `hero-wrap` を 100vh に畳む、H1 は正立静止。
- [x] H1・役割・説明は実テキストで DOM に存在し、両モードでコントラスト AA。
      ― Hero は field（black）両モード不変。cream 15.37／説明の gray on black 4.82（本文）。

### イントロ
- [x] 初回のみ（`sessionStorage`）ポスター組み上げが `steps/linear` で走り、SKIP・任意入力で中断できる。
      ― `PosterIntro.astro`。`sessionStorage.introSeen` で 1 セッション 1 回。赤块 steps(4)／帯 steps(3)／H.NIGO 各字 steps(1)・40ms stagger／
      円・斜線 steps(4)／退場は clip-path inset steps(6)。`SKIP ▸` クリック・任意 keydown・pointerdown で `end()`（idempotent）。
- [x] **PRM ではイントロ非実行**（素の Hero が即表示）。JS 無効でも Hero が壊れない。
      ― `.intro{display:none}` が既定（built CSS で確認）。JS が `prm || seen` を判定して `.run` を付与しない限り覆わない。
      JS 無効時も `.run` が付かず素の Hero が表示。PRM/既読時は `introSeen` を既読化して以後も非実行。
- [x] イントロ中フォーカストラップ・`inert`、退場後の焦点/スクロール位置が破綻しない。
      ― 開始時に背景（`#topbar`/`.railnav`/`#main-content`/`footer`）を `inert`＋`documentElement.overflow:hidden`、SKIP へフォーカス。
      非 inert の可フォーカス要素は SKIP のみ＝実質トラップ。退場後は inert 解除・overflow 復帰・`scrollTo(0,0)`、H1 へは焦点を渡さない。

### 装飾一本化
- [x] Phaser `ConstructivistCanvas` の各セクション設置が撤去され、初期 JS が明確に減る（Phaser チャンク未ロード）。
      ― 7 セクションの `ConstructivistCanvas` を撤去。`ConstructivistCanvas.tsx`・`src/components/phaser/*` を削除、
      `package.json` から phaser 依存を除去。build のチャンク一覧に phaser（旧 ≈343kB gzip）が現れないことを確認。
- [x] 他セクション装飾が CSS/SVG（＋少数の軽量 3D 脇役）で構成主義語彙を保つ。
      ― 赤縦バー・大円・回転赤块・ダイヤモンドマーカー等の CSS 幾何は維持。軽量 3D 脇役 `SectionAccent`（three.js・遅延）を各セクションに残置。

### 署名インタラクション — **撤回（不採用）**
- [—] 署名インタラクション「COMPOSE AN ISSUE」は一度実装したが、ユーザー判断で**削除**（§9 参照）。
      ― `IssueForge.astro`・`.forge*`/`.issue-btn`/`.gp*` スタイル・`index.astro` の使用箇所・`CustomCursor` の `issue-btn` 参照を除去。
      AI セクションの見せ場は「ツール説明カード＋INTEREST & FOCUS」で成立。Hero（フル3D・§6）が第一の見せ場。

### カーソル / スクロール
- [x] `pointer:fine` のみカスタムカーソル（十字→塗り四角→照準の 3 状態）。粗ポインタは既定カーソル。
      ― `CustomCursor.astro`。`matchMedia('(pointer: fine) and (hover: hover)')` のみ有効化。十字（cream 1px 縁取り）→ `.on-link` 塗り四角 →
      地図プレート/INDEX/OPEN AN ISSUE/CTA（`data-cursor-big`）で `.on-big` 中空正方形。状態変形は transition なし＝瞬時。
- [x] **PRM で追従 lerp 無効・瞬時変形**。JS 失敗時はネイティブカーソルが残る（`cursor:none` は JS 成功後のみ）。
      ― PRM 時は rAF lerp を回さず mousemove で即スナップ。`cursor:none` は JS が付与する `body.fine` 配下のみ、`.cursor` は既定 `display:none`。
- [x] 慣性スクロールライブラリ非導入。全モーションが `linear/steps`。
      ― 追加した署名/カーソル/イントロは transition steps・CSS steps・rAF lerp（線形）のみ。smooth-scroll ライブラリ無し。

### 横断
- [x] 角丸（矩形）・ソフトシャドウ・glassmorphism・バウンス easing の導入ゼロ。新規の重い依存ゼロ
      （可変フォント無し・Phaser 退役で正味減）。
      ― フェーズ 1 で追加したモーションはトグル steps(1)／地図シャッター steps(4)・linear のみ。角丸・影・glass 無し。phaser 依存を除去し正味減。
- [x] `npx astro check` 0 エラー、`npm run build` 成功。
- [ ] Lighthouse A11y 95+ を維持（デプロイ後計測）。Performance は 3D/モーション込みで現実的に最適化。
      ― **未計測（デプロイ後の実機 Lighthouse で確認する項目）**。実装側の a11y 前提（両モード AA・PRM 全経路・focus 可視・
      dialog トラップ・aria）は充足済み。
- [x] 全新規モーションが PRM で静的フォールバックを持つ（本 spec 各章の定義どおり）。
      ― イントロ=非実行（素の Hero）／カーソル=lerp 無効・即スナップ／署名=飛来なし即時配置。既存（3D Hero・キネティック・
      マーキー・地図シャッター・reveal）も PRM 静的化済み（フェーズ1・2）。

---

## 16. 実装順の推奨（frontend）

段階ごとに `astro check` + build + `design-review`（実物スクショ）を通す。

1. **基盤: セマンティック CSS 変数 ＋ ダークモード**（§2）。FOUC 防止スクリプト・トグル・OS 追従・
   既存 `bg-constructivist-*` の段階置換。ここで**両モードのコントラストを実機で確定**（他の派手要素の前提）。
2. **ナビ刷新: 番号列 ＋ フル地図 dialog**（§3）。上部バー縮約。既存 IntersectionObserver を流用。
3. **装飾一本化: Phaser 撤去**（§8）。初期 JS 削減を確認（perf の余白をここで作る）。
4. **破壊的グリッド ＋ キネティックタイポ（静的〜scroll）**（§4/§5）。calm は現行維持、loud を追加。
5. **没入 3D ヒーロー**（§6）。ProunCanvas をフルビューポート scroll 駆動へ。フォールバック/PRM を先に固める。
6. **署名インタラクション（AI）**（§9）。CSS/3D で Issue→実装を再発明。
7. **カーソル ＋ イントロ**（§10/§7）。最後に載せる"化粧"。PRM/JS 無効/pointer 分岐を必ず先に。
8. **総点検**: Lighthouse・PRM 全経路・キーボード動線・両モード全ペア AA・モバイル縮退。

> 各段は独立に価値がある（途中で止めても壊れない）よう積む。1→3 で「土台と perf 予算」を確保してから
> 4→7 の攻めを載せる。
</content>
</invoke>
