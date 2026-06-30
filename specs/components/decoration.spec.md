# 装飾レイヤー（Tiled + Phaser）コンポーネント仕様

> ステータス: **実装フェーズ 1〜5 完了（チューニング待ち）** — 全セクションに導入済み。
> 本書は「Tiled + Phaser による個人サイト装飾」の設計合意を凝縮した SDD 仕様。

## 目的

現状の CSS 図形ベースの装飾（`ParallaxDecorations.tsx`）を発展させ、
**Tiled でオーサリングした構成主義タイルマップを Phaser（WebGL）で描画・アニメーション**する装飾レイヤーを導入する。
単なる飾りではなく、サイト主（H.Nigo）の**「AI エージェント駆動開発」というアイデンティティを寓意する仕掛け**にする。

---

## 設計の決定事項（対話サイクルの結論）

| 軸 | 決定 | 補足 |
|----|------|------|
| **配置範囲** | セクション毎に独立した Phaser パネル | hero 専用でも全画面常駐でもない。中間負荷。 |
| **インタラクション** | 軽い遊び要素を仕込む | 主役は自律アニメ、副次的にユーザ操作を受ける。 |
| **アート方針** | 構成主義をベースに拡張 | 赤/黒/クリーム・幾何学を守りつつタイルならではの表現を足す。 |
| **プレイ機構** | 構成主義エージェント | グリッドを巡回しタイルを「実装」する小さな幾何学キャラ。 |
| **セクション対応** | 統一モチーフの変奏 | 同じ語彙（赤四角・円弧・斜線・太線）を、密度と配色で各セクションに変奏。 |
| **キャプション** | 置かない（純装飾） | 「これは何か」の説明は付けない。canvas は無情報・aria-hidden。 |
| **エージェントの賢さ** | 構成主義ヒューリスティク | 対角バランス・余白・赤黒の拮抗を意識した「良い」配置に寄せる。 |
| **タイル資産形式** | SVG ランタイム生成 | Retina 破綻なし。枚数が少なく描画コストは許容。 |
| **フォールバック生成** | SVG 手書き | 軽量・依存なし。Phaser ヘッドレス→PNG は不採用（ビルド複雑化）。 |

---

## 中核コンセプト: 「Issue → 実装」エージェント

このサイトの核は **Issue 起票 → AI エージェントが実装 → PR** という開発スタイル。
これを装飾の遊びにそのまま落とす:

1. **自律モード（既定）**: 小さな構成主義エージェントがグリッドを巡回し、
   空きセルにタイルを少しずつ配置 → セクションの構成主義「作品」を build していく。
2. **Issue モード（操作）**: ユーザがグリッドの空きセルをクリック = **Issue を立てる**。
   ゴーストの輪郭タイルが出現し、エージェントがそこへ pathfind して **「実装」して埋める**。
3. 完成した構成は一定時間で「リファクタ」され（タイルが組み替わり）、また build が始まる。

> 装飾が「サイト主が何をする人か」を能動的に語る。over-engineering を避けるため、
> ゲーム性は最小限（スコアや勝敗なし）に留める。

---

## 技術アーキテクチャ（確定・ぶらさない）

- **単一 `Phaser.Game` + 複数 `Scene`**: パネル毎にゲームを立てない。セクション = Scene。
- **遅延ロード**: Astro `client:visible` でラッパーをマウントし、その時点で初めて
  `import('phaser')` を動的実行。初期 JS バンドルに Phaser（〜1MB）を載せない。
- **オフスクリーン休止**: `IntersectionObserver` で可視外の Scene は `scene.pause()` /
  可視で `scene.resume()`。CPU/GPU を食わせない。
- **描画上限**: WebGL レンダラ。`resolution` / DPR に上限（モバイルのバッテリ保護）。
  FPS は 30〜60 で頭打ち、必要なら `setTargetFPS` 相当の間引き。
- **レンダラ**: 既定 `AUTO`（WebGL→Canvas フォールバック）。

### A11y / フォールバック

- canvas は `aria-hidden="true"`、`pointer-events` はパネル内に限定し
  **本文のスクロール・操作を一切奪わない**。
- `prefers-reduced-motion: reduce` の場合と WebGL 非対応・低性能端末では、
  アニメを起動せず **Tiled 構成を静的プリレンダーした画像（SVG または PNG）** を表示する。
- キーボード操作・スクリーンリーダーには装飾は不可視（情報を持たせない）。

---

## Tiled オーサリングパイプライン

```
Tiled (.tmx / .tsx)  ──export──▶  public/tilemaps/*.json (+ tileset png/svg)
                                          │
                                  Phaser load.tilemapTiledJSON
```

- **共有タイルセット 1 枚**: 構成主義プリミティブ（後述）。`assets/constructivist-tileset.*`。
- **セクション毎マップ**: `hero.json` / `skills.json` / `career.json` … 同一タイルセットを参照。
- マップはグリッド寸法・初期配置・エージェント巡回の「下地」を定義。
  実際のタイル配置はランタイムでエージェントが動的に変える（Tiled は初期状態と
  タイル語彙の供給源）。
- 生成物（JSON / 画像）は `public/tilemaps/` に置きビルドに含める。`.tmx` 等の
  ソースは `assets/tiled/`（リポジトリ管理、ビルド非対象）に置く。

---

## タイルセット定義（構成主義プリミティブ）

エル・リシツキー「About Two Squares」の語彙を最小単位に分解:

| ID | タイル | 用途 |
|----|--------|------|
| 1 | 赤い実心正方形 | 主役・アクセント |
| 2 | 黒い実心正方形 | 対の図形・重み |
| 3 | クリーム枠の正方形（中空） | 軽い構造 |
| 4 | 円 / 円弧（赤・クリーム） | 動きと対比 |
| 5 | 斜線（45°・太/細） | 力線・運動 |
| 6 | 太い直線（縦/横） | グリッドの骨格 |
| 7 | 小さなドット | リズム・余白の点 |
| 8 | エージェント（赤い楔 + 黒い視線ライン） | プレイヤキャラ |

- 角丸なし・シャープエッジ厳守。色は `tailwind.config.mjs` の `constructivist.*` と一致。
- タイルはベクター（SVG）由来でレンダリングし、Retina でも破綻させない方針。

---

## セクション別の変奏（統一モチーフ）

| セクション | 配色の重心 | 密度 | エージェント |
|-----------|-----------|------|-------------|
| Hero | 赤 ＞ 黒（暗背景） | 中 | 1体・ゆったり巡回 |
| About | 黒線基調（明背景） | 低 | 1体 |
| Skills | 赤枠多め（暗背景） | 高（グリッドが積み上がる） | 1体 |
| AI | エージェント強調（明背景） | 中 | 2体・協調動作 |
| Career | 赤い縦の力線＝時間軸（暗背景） | 中（やや疎・縦に通す） | 1体・縦移動主体 |
| Portfolio | 中空正方形のリズム（明背景） | 中 | 1体 |
| Contact | 大円 + 単一の赤四角（暗背景） | 低 | なし（静） |

> 既存の各セクション背景色（`bg-constructivist-black` 等）の上に重ねるため、
> 暗/明背景でタイルのコントラストが成立するよう配色重心を切り替える。

---

## Hero 変奏のデザイン指針（第一印象 ＝ 赤の主役性と対角の力線）

> **⚠ 更新（3D Proun 導入）**: Hero の背面 2D タイル装飾（`ConstructivistCanvas section="hero"`）は
> **El Lissitzky の軸測 3D Proun レイヤーへ置換**する方針に決定（正典: `specs/components/proun-3d.spec.md`）。
> 以下の「装飾タイルの主役性（canvas）」「hero seed の構図調整」節は **2D タイルを維持する場合の指針**として残すが、
> 3D へ置換した場合は `proun-3d.spec.md` が Hero 背面の正典になる。本文（AnimatedHero）の
> **タイポ階層・構図・余白・コントラスト・モーション**に関する指針（下記）は **3D 置換後も有効**で、
> 3D Proun は本文の同じ「二正方形・赤い楔・対角の力線」の語彙を 3D で反復する。

> 対象: `src/pages/index.astro` の最初の `section`（暗背景 `bg-constructivist-black` / `min-h-[90vh]`）、
> `src/components/AnimatedHero.tsx`、`src/components/phaser/sections.ts` の `hero` 設定、
> `assets/tiled/gen-tilemaps.mjs` の `hero(d)` seed、`public/tilemaps/hero.json`。
> Hero はサイトの「掴み」。3 秒以内に「構成主義 × ソフトウェアエンジニア H.NIGO」を視覚で言い切る。
> 構図プロトタイプ: `prototypes/hero-composition.html`（2D 版）、`prototypes/proun-3d-axonometric.html`（3D 版・依存なし・図解用）。

### 第一印象の設計原則（エル・リシツキー「About Two Squares」の対）

Hero は **赤い正方形（主役）と黒い正方形（対の重み）が対角に拮抗する**構図を全体の骨格にする。
本文ブロック（左）の `AnimatedHero` の Proun コンポジション（右上の赤ブロック＋黒ブロック＋クリーム円）と、
背後の canvas タイル装飾が**同じ「二つの正方形」の語彙**を反復し、画面全体を一つの構成主義作品にする。
語彙は増やさない。**赤の主役性・対角の力線・余白の緊張・タイポ階層**の 4 つで第一印象を高める。

### タイポ階層（AnimatedHero — 実装は frontend）

第一印象は「名前 H.NIGO が極大で最初に目に入り、役割が赤帯で次に、説明文が最後」という
**明確な 3 段の優先順位**で決まる。現状はこの階層が概ね成立しているが、第一印象を強めるための調整方針:

- **H1（名前 H.NIGO）= 最強**: 現状の `text-[5.5rem]→lg:text-[10rem]` / `tracking-tighter` / `leading-none` を維持。
  これがファーストビューの「掴み」。背後の薄い `01`（`opacity 0.05`）は Lissitzky 的ナンバリングとして残すが、
  装飾なので `aria-hidden`（既に付与済）。**H1 と canvas タイルの cream が競合しないこと**が階層維持の条件
  （後述の palette 調整で担保）。
- **役割（SOFTWARE ENGINEER）= 第2階層**: 赤帯（`bg-constructivist-red`）＋左の楔（赤三角）で「赤の主役性」を
  名前直下に置く現状は良い。第一印象を強めるなら、赤帯は H1 の左端から始まる**水平の力線**として効かせ、
  楔の鋭角で視線を右（本文）へ送る役割を維持する。
- **小ラベル（Software Engineer — Sapporo, Japan）= 第0階層（リード）**: 赤い短い横線＋`tracking-[0.3em]` uppercase で
  「これから始まる」という導入。`text-xs text-constructivist-red` のコントラストに注意（後述 a11y）。
- **説明文 = 第3階層（最弱）**: `text-constructivist-gray` ＋左赤ボーダーで主役を譲る現状を維持。
  gray on black ≒ 4.82:1 で通常本文 AA(4.5:1) を満たす（後述）。階層上は弱めてよく、現状トークンで可。
- **リズム**: H1（極大）→ 役割（中・赤帯）→ 説明（小・gray）の**サイズの跳躍を大きく保つ**ことで階層が立つ。
  中間サイズの要素を増やさない（語彙を増やさない原則）。

### 構図・余白の緊張（対角バランス）

- **対角の力線**: 視線は「左下の小ラベル → 左の極大 H1 → 右上の赤い Proun ブロック → 右の avatar」へと
  **左下→右上の対角**で流れるのが理想。現状、Proun コンポジションが右上、avatar が右側に**縦に重なって**おり、
  右側が過密になりがち。frontend への提案: **avatar をやや下げる / Proun ブロックと avatar の間に余白の谷を作り**、
  右上（Proun）と右中（avatar）が別々の重心として読めるようにする（`md:mt-20` の余白を活かす）。
- **余白の拮抗（アシンメトリ）**: 左カラム（テキスト）が重いぶん、右上の赤ブロックを**画面右端ぎりぎりまで寄せ**、
  左下〜中央に**意図的な余白（黒の海）**を残す。この「空」が H1 の大きさを引き立てる。canvas タイル装飾は
  この余白側（左下・中央下）を**疎**にし、右上〜中央右に密度を寄せて Proun と呼応させる（seed 節参照）。
- **下部の区切り装飾（赤いダイヤ＋線）**: 現状の `mt-12` の水平ルールは「ここで Hero が閉じる」境界として有効。
  対角の流れを受け止める**水平の底**として維持。

### 装飾タイルの主役性（canvas — sections.ts / seed）

> ※ この節は **2D タイル装飾を維持する場合**の指針。3D Proun へ置換した場合は `proun-3d.spec.md` を参照。

Hero タイル装飾は「掴み」の一部。本文の Proun コンポジションと**同じ二正方形の語彙**を背後で反復し、
画面全体に構成主義の密度を与える。ただし**本文（極大 H1・赤帯・avatar）が主役**であり、装飾は増幅役。

- **配色重心 = 赤を主役、cream を抑える**: 現状 `red 0.55 / black 0.15 / cream 0.3`。
  cream `#F5F0EB` on black ≒ 15.4:1 は非常に明るく、**極大の cream H1 と視覚的に競合**しうる。
  第一印象では「赤い正方形が主役」を明確にするため、**cream をやや下げ、赤をさらに主役化**する:
  提案 `red 0.6 / black 0.2 / cream 0.2`。black を 0.15→0.2 に上げるのは「赤の対の黒正方形」を
  Lissitzky 的に増やし、二正方形の拮抗を canvas でも表現するため（黒は暗背景に沈むので本文を邪魔しない）。
- **密度 = やや上げて掴みを強める**: 現状 `0.32`。Hero は最も注目される面なので**やや密**に。
  提案 `0.36`。ただし密度を上げる分、seed と配置重心で**本文カラム（左〜中央）背後を疎**に保ち、
  右上〜中央右に寄せて H1・赤帯の可読性を守る。
- **形状 = redSquare 最重 / diagonal で対角の力線 / circle で運動**: 現状
  `redSquare 3, circle 2, diagonal 2, dot 2, barV 1, arc 1`。第一印象の「対角の力線」を強めるため、
  **diagonal を circle と同格以上に**し、redSquare の主役性を保つ。提案
  `{ redSquare: 4, diagonal: 3, circle: 2, dot: 2, blackSquare: 1, arc: 1 }`。
  barV は Hero では落とす（縦の力線は Career の語彙。Hero は対角＝diagonal が力線）。
  blackSquare を 1 加えるのは palette の black 増と呼応し「赤の対の黒」を出すため。
- **エージェント挙動**: `agents: 1`・ゆったり巡回を維持。第一印象では「静かに build される構成主義作品」が
  ふさわしく、過剰な動きは H1 の可読性を損なう。**初期 seed の時点で対角構図が成立**していること
  （エージェントが組み替えても骨格が崩れない）を重視。

### hero seed の構図調整（gen-tilemaps.mjs — 対角＋本文回避）

> ※ この節は **2D タイル装飾を維持する場合**の指針。3D Proun へ置換した場合は `proun-3d.spec.md` を参照。

現状の seed は赤正方形が `(2,1)` と `(9,1)` でほぼ左右対称に並び、**対角の力線が弱く・本文カラム左側
（col 2 付近）に赤正方形が乗って H1 と干渉**しやすい。第一印象の骨格として以下に組み替える方針（14×7 グリッド）:

- **対角の力線**: 左下（col 1〜3, row 5〜6）から右上（col 10〜12, row 0〜1）へ **diagonal(gid6) を斜めに連ね**、
  左下→右上の視線の流れを seed レベルで作る。
- **赤の主役正方形**: 主役の redSquare(gid1) は**右上の象限（col 10〜12, row 0〜1）**に置き、
  AnimatedHero の右上 Proun 赤ブロックと**前後で重なって増幅**させる。対の blackSquare(gid2) を
  その斜め下（col 9, row 2 付近）に置き「二正方形の対」を作る。
- **本文カラム回避**: 左〜中央上（col 1〜6, row 0〜2＝極大 H1 と赤帯の背後）は**疎**にし、ドット(gid9)や
  細い要素のみ。redSquare をこの帯に置かない（H1 cream との干渉回避）。
- **運動の円・刻みのドット**: circle(gid4)/arc(gid5) は中央右（col 7〜9）に 1〜2 点、dot(gid9) を余白側に散らして
  リズムを作る。形状語彙は sections.ts の shapeWeights と整合させる（barV は使わない）。

> 具体的な put 座標は frontend が seed を書き換える際に上記の「象限の役割分担」に従う。
> 骨格: 右上＝赤の主役、その斜め下＝黒の対、左下→右上＝diagonal の力線、左中上＝疎（本文回避）。
> 参考レイアウトは `prototypes/hero-composition.html` を見ること。

### 配色・コントラスト（暗背景 #1A1A1A 上 / a11y）— 実測値

- **red `#D62828` on black ≒ 3.48:1** — 装飾図形（非テキスト・グラフィカル要素は 3:1 で十分）として OK。
  **赤い正方形を主役**にできる。ただし**赤を本文テキスト色には使わない**（通常テキスト AA 4.5:1 未達）。
- **小ラベル `text-xs text-constructivist-red` on black ≒ 3.48:1** は**通常テキスト AA(4.5:1) 未達**。
  第一印象上は赤のアクセントとして許容範囲だが、厳密には
  **小ラベルを `text-constructivist-cream`（cream on black ≒ 15.4:1）にし、赤は横線・楔だけで担保**する案を推奨。
- **役割の赤帯**: cream on red ≒ 4.42:1。`text-xl sm:text-2xl`（大文字・大サイズ）で**大テキスト AA(3:1) を満たす**。
  通常テキスト基準(4.5:1)にもほぼ達しており問題なし。
- **説明文 `text-constructivist-gray (#8B8680)` on black ≒ 4.82:1** は**通常本文 AA(4.5:1) を満たす**。現状トークンで可。
- 装飾は canvas（`relative z-10` の本文より下層）。**装飾の密度を上げても本文テキストのコントラストは
  装飾が背後で下げない**こと（タイルは本文カラム背後で疎）。

### モーション（reduced-motion 配慮）

- `AnimatedHero` の react-spring（trail スライドイン・赤/黒ブロックの scale+rotate）は第一印象の演出として有効。
  ただし**`prefers-reduced-motion: reduce` 時は遷移を無効化し、最終状態（`ready`）を即時表示**する設計にする
  （frontend: `useReducedMotion` 等で `immediate` 化、または初期 transform をスキップ）。装飾の派手な回転は
  reduced-motion では出さない。
- canvas 装飾は既存方針どおり reduced-motion / 非対応時は静的フォールバック（`public/decoration-fallback/hero.svg`）。
  フォールバックでも**「右上の赤い主役正方形＋黒の対＋左下→右上の diagonal 力線」の対角構図が静止で読める**こと。

### 受入条件（Hero）

- [x] `hero` の配色重心が**赤主体**（red ≥ black かつ red ≥ cream／cream は極大 H1 と競合しないよう抑制）。
      ― `palette: { red: 0.6, black: 0.2, cream: 0.2 }`（sections.ts 反映済）
- [x] `shapeWeights` が **redSquare 最重**、diagonal で対角の力線、circle で運動、blackSquare で対の重み。
      barV は出現しない（縦の力線は Career の語彙）。 ― `{ redSquare: 4, diagonal: 3, circle: 2, dot: 2, blackSquare: 1, arc: 1 }`
- [x] `density` を**やや上げて掴みを強める**（`0.36`）一方、本文カラム背後（左〜中央上）は seed で疎に保つ。
      ― density 0.36、seed の左中上(col 1〜6,row 0〜2)はドット1点(col4,row1)のみ。
- [x] hero seed が**左下→右上の diagonal 力線**と**右上の赤い主役正方形（＋斜め下の黒の対）**を持ち、
      極大 H1・赤帯の背後（左〜中央上）に redSquare を置かない（本文との干渉回避）。
      ― gid1 を (11,0)/(12,1)、対の gid2 を (9,2)、diagonal(gid6) を (1,6)→(3,5)→(7,3)→(10,1) に連ねた。
- [x] タイポ階層が H1（極大 cream）→ 役割（赤帯）→ 説明（gray・小）の**明確な 3 段**で、サイズの跳躍が大きい。
      ― H1 `text-[5.5rem]→lg:text-[10rem]`、役割 `text-xl sm:text-2xl` 赤帯、説明 `text-base sm:text-lg` gray を維持。
- [ ] 右側（Proun ブロックと avatar）が過密にならず、対角の流れと余白の谷が成立（avatar とブロックが別重心）。
      ― Proun を右端へ寄せ（red `right-0`）、avatar を `md:mt-32` へ下げて別重心化。最終的な「谷」の見えは preview 目視待ち。
- [x] 小ラベルの赤テキストは AA(4.5:1) 未達のため cream 化を推奨（赤は横線・楔で担保）。説明文 gray は AA 達成で現状可。
      ― 小ラベルを `text-constructivist-cream` 化、近傍の `w-8 h-0.5 bg-constructivist-red` 横線で赤を担保。
- [x] reduced-motion 時に `AnimatedHero` の遷移が無効化され最終状態が即時表示、canvas は静的フォールバック。
      ― `useReducedMotion()` で全 spring/trail を `immediate` 化。canvas フォールバックは既存 `StaticComposition`（hero.json から SVG）。
- [ ] 暗背景上で赤い主役正方形が視認でき、cream タイルが極大 cream H1 と混同・競合しない。
      ― palette cream 0.2 へ抑制し seed の左中上に cream を置かない設計だが、最終視認は preview 目視待ち（本環境では playwright 不在）。

---

## Career 変奏のデザイン指針（縦の力線 ＝ 時間軸）

> 対象: `src/pages/index.astro` の `id="career"`（暗背景／縦ライン＋ダイヤモンドマーカーの時系列）と
> `src/components/phaser/sections.ts` の `career` 設定、`public/tilemaps/career.json`。

### 構図意図

- Career の本文は**左端に赤い縦ライン（`left-5`）＋赤いダイヤモンドマーカー**を持つ時系列。
  装飾は「**時間の流れ＝縦に伸びる力線（barV）**」をこの本文の力線と**呼応**させ、増幅する。
  装飾が主役を奪わず、本文の赤い縦軸を**右側に反復・変奏**して画面全体に縦のリズムを通すのが狙い。
- 配色重心は **赤を時間軸の主色**に据える。現状の cream 0.5 重心は「明るく軽い skills 的トーン」で、
  時間軸＝力線の意図と弱い。**赤を重心、クリームは細い縦線の輝点に絞る**ことで、暗背景上に
  「赤い時間の柱」が立つ構図にする。
- **動的アシンメトリ**: barV は等間隔に並べない。本文が左に寄るぶん、装飾の縦バーは
  **中央〜右に重心**を置き、左端（本文の縦ライン帯 = 横 col 0〜2 相当）は疎にして本文と干渉させない。
  縦バーの「途切れ」と「斜線（diagonal）の差し込み」で、機械的な縞ではなく構成主義的な緊張を作る。
- 形状語彙は増やさない。**barV（縦の力線）を主役**、**diagonal（運動）を副**、
  **dot（時間の刻み・リズム）を点**として添える。redSquare は「節目（マーカーの寓意）」として少数。
  circle は時間の円環として極少数のアクセント。barH・hollowSquare は Career では使わない（横の骨格は
  時間軸の縦性を弱めるため）。

### 配色・コントラスト（暗背景 #1A1A1A 上）

- red `#D62828` on black ≒ 3.9:1 — 装飾図形（非テキスト）として十分。**赤い縦バーを主役**にできる。
- cream `#F5F0EB` on black ≒ 14:1 — 非常に明るい。**多用すると本文（cream 見出し・cream の tech タグ）と
  視覚的に競合**するため、Career では**細い縦線・ドットの輝点に限定**して重みを下げる。
- 装飾は `relative z-10` の本文より下層（canvas）。本文テキストの可読性を最優先し、
  **装飾の総密度はやや疎（中）**に保ち、本文カラム（左寄り）の背後は薄くする。

### モーション（reduced-motion 配慮）

- エージェントは Career では**縦移動を主体**にし、「時間軸を上→下へ build していく」挙動で
  コンセプトを補強する（厳密な縦限定ではなく、縦バー列を優先ターゲットにする程度）。
- `prefers-reduced-motion: reduce` 時は静的フォールバック（`public/decoration-fallback/career.svg`）。
  フォールバックでも「赤い縦の力線＋疎なドット」の構図が読めること（barV が静止状態でも主役）。

### 受入条件（Career）

- [x] `career` の配色重心が**赤主体**（red ≥ black かつ red ≥ cream／cream は輝点用に低め）になっている。 ― `palette: { red: 0.6, black: 0.1, cream: 0.3 }`
- [x] `shapeWeights` が **barV 最重**、diagonal 次点、dot で刻み、redSquare/circle は少数。
      barH・hollowSquare は出現しない（縦性を保つ）。 ― `{ barV: 4, diagonal: 2, dot: 2, redSquare: 1, circle: 1 }`
- [x] 装飾の縦バーが本文の赤い縦ライン（`left-5`）と**呼応**しつつ、本文カラム左端と
      **重なって可読性を損なわない**（重心は中央〜右）。 ― seed の barV(gid7) を col 7/9/11 に集約、左端 col0〜2 はドット1点のみ
- [ ] 暗背景上で赤い縦バーが視認でき、cream 輝点が本文 cream テキストと混同・競合しない。 ― 目視確認待ち（本環境では playwright 不在でスクショ未取得）
- [x] reduced-motion 時のフォールバックでも「赤い縦の力線＝時間軸」の構図が成立する。 ― フォールバックは `StaticComposition` が career.json seed から SVG 生成、再生成済の barV 集約がそのまま反映
- [x] 本文タイムライン（年・業種・技術タグ）のコントラストは AA を維持（装飾が背後でこれを下げない）。 ― 本文テキストのトークン・配置は不変、装飾は canvas 下層のまま

---

## エージェント仕様

- **見た目**: 赤い楔（三角）+ 黒い「視線」ライン。サイズはタイル1マス相当。
- **状態機械**: `IDLE`（巡回） → `MOVING`（pathfind 中） → `BUILDING`（タイル設置の小アニメ） → `IDLE`。
- **巡回**: グリッド上をマンハッタン移動。空きセルを探索し、**構成主義ヒューリスティク**
  （対角バランス・余白・赤黒の拮抗をスコア化）で「良い」セルを選んでタイルを置く。
- **Issue 受領**: クリックで生成されたゴーストセルを最優先ターゲットにし、到達後 `BUILDING`。
- **AI セクション**: 2体が異なる色のタイルを分担して置く（協調を演出）。
- **Career セクション**: 縦バー列を優先ターゲットにし、上→下へ「時間軸を build」する挙動に寄せる。
- 経路探索は軽量（A* もしくはグリッド BFS、グリッドが小さいので十分）。

---

## インタラクション仕様

- **クリック / タップ**: 空きセル → Issue 生成（ゴースト）。エージェントが実装。
- **ホバー（任意・デスクトップのみ）**: カーソル近傍のタイルが微かに浮く程度（過剰反応はしない）。
- モバイルでは Issue モードのタップのみ。スクロールを阻害しないよう
  パネルの `touch-action` を適切に設定。

---

## ディレクトリ構成（新規）

```
src/components/
  ConstructivistCanvas.tsx     # Astro から使う React ラッパー（client:visible）
  phaser/
    game.ts                    # Phaser.Game ブートストラップ（遅延 import）
    scenes/DecorationScene.ts   # 共通シーン（セクション設定で差分化）
    agent.ts                   # エージェント状態機械
    tiles.ts                   # タイルセット定義・SVG 生成
public/tilemaps/
  *.json                       # Tiled 出力
assets/tiled/
  *.tmx / *.tsx                # Tiled ソース（ビルド非対象）
public/decoration-fallback/
  *.svg                        # reduced-motion / 非対応時の静的構成
```

---

## 実装フェーズ計画（段階導入・各段で `astro check` + 目視）

1. **足場**: `ConstructivistCanvas` ラッパー + Phaser 遅延ロード + 空シーンを Hero に1枚。
   性能・遅延ロード・aria-hidden・フォールバック分岐を先に固める。
2. **タイル & 静的描画**: タイルセット生成、Tiled マップ（Hero）を読み込み静的描画。
   フォールバック画像もこの段で用意。
3. **エージェント自律モード**: 巡回 + 確率配置。1体。
4. **Issue モード**: クリック→ゴースト→pathfind→実装。
5. **全セクション展開**: 変奏テーブルに沿って各セクションへ。AI セクションは2体協調。
6. **チューニング**: FPS/DPR 上限、モバイル実機確認、Lighthouse 回帰確認。

> 既存 `ParallaxDecorations` は当面**併存**。セクション毎に段階的に置換し、
> 各段で「軽さが保てているか」を確認しながら枯らす。

---

## 受入条件

- [x] 初期 JS バンドルに Phaser が含まれない（遅延ロードされる）― build で `game.*.js` が別チャンク（343kB gzip）に分離、reduced-motion 時はそもそも未ダウンロードを確認
- [x] 可視外セクションの Scene が休止し、CPU 使用が抑えられる ― `IntersectionObserver` で pause/resume
- [x] `prefers-reduced-motion` で静的フォールバックが表示される ― 検証済（canvas 0 / SVG fallback 表示 / phaser 未ロード）
- [x] WebGL 非対応環境でフォールバックまたは Canvas で破綻しない ― WebGL 判定でフォールバック分岐
- [x] canvas が `aria-hidden`、本文のスクロール・操作を阻害しない ― host を `aria-hidden`、コンテンツを `z-10` で上に出す
- [x] モバイルでスクロールがタイルパネルに奪われない ― Phaser `input.touch.capture=false` + `touch-action: pan-y`
- [x] 構成主義パレット（赤/黒/クリーム）と既存デザインの一貫性が保たれる ― スクショで確認
- [x] エージェントが巡回しタイルを配置する自律動作が見える ― Hero スクショで楔エージェント・タイル確認
- [x] 空きセルクリックで Issue が立ち、エージェントが実装する ― ゴースト→pathfind→設置を実装
- [ ] Lighthouse Performance 90+ / Accessibility 95+ を維持 ― 実機/CI で要計測（次フェーズ）
- [x] `astro check` でエラーがない ― 0 errors

---

## 確定論点（サイクルで枯らした結論）

- **A11y/動機**: キャプションは**置かない**。canvas は完全に無情報・`aria-hidden`。
  「気付いた人だけに伝わる」ミニマルな佇まいを優先。
- **フォールバックの作り方**: **SVG 手書き**。軽量・依存なし。Phaser ヘッドレス→PNG は不採用。
- **タイル資産の形式**: **SVG ランタイム生成**。Retina 破綻なし、描画コストは許容範囲。
- **エージェントの「賢さ」**: **構成主義ヒューリスティク**。対角バランス・余白・赤黒の
  拮抗を評価して「良い」セルへ寄せる（完全ランダムは不採用）。
- **置換範囲**: `ParallaxDecorations` は段階置換中の**併存のみ許容**。最終的に
  Phaser パネルへ寄せる。Contact など「静」のセクションは Phaser でも CSS でも可
  （実装フェーズ 5〜6 で軽さを見て判断）。
- **Hero 背面の 3D 化**: Hero に限り 2D タイルを **El Lissitzky 軸測 3D Proun** へ置換（`specs/components/proun-3d.spec.md`）。
  他セクションは 2D タイルを維持。3D は Hero のみの showpiece。

## 次サイクル（実装フェーズで検証する論点）

- ヒューリスティクの具体的スコア関数（対角・余白・拮抗の重み）は実装フェーズ 3 で調整。
- モバイル実機での FPS/DPR 上限値はフェーズ 6 で実測して決める。
