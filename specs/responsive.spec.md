# モバイル / レスポンシブ デザイン指針（横断）

## 目的

モバイルファースト（基準幅 ~390px）で、構成主義デザイン言語（パレット内・シャープエッジ・対角構図）を
保ったまま **(1) 装飾が本文可読性を損なわない (2) タップ領域が十分 (3) 縦積み時に構図が破綻しない**
ことを担保する指針と受入条件を定める。実装は frontend。トークンは `tailwind.config.mjs` の
`constructivist.*` 内に限定する。

対象: `src/components/AnimatedHero.tsx` / `src/pages/index.astro` 各セクション /
`src/components/phaser/sections.ts`（装飾の density・cellSize）/ `src/components/ConstructivistCanvas.tsx`
（`cellSizeFor`）/ `src/components/Header.astro`（ナビ・タップ領域）。

---

## R1. Hero モバイルの赤 Proun ブロックが小ラベルに被る（要修正・最優先）

### 問題

`AnimatedHero.tsx` の右上 Proun コンポジション（L83）は `absolute top-0 right-0 w-80 h-80`、
内側の赤ブロックは `absolute top-4 right-0 w-52 h-52`（208px）。Round 2 で `right-0` に寄せた結果、
モバイル幅（~390px、`px-4` で本文域 ~358px）では赤ブロックが**画面上部 y≈16〜224px を占有**し、
テキストカラム先頭の小ラベル「SOFTWARE ENGINEER — SAPPORO, JAPAN」（py-16 直下、y≈64px 付近）に**重なる**。
小ラベルは cream テキストで、赤ブロック（red `#D62828`）の上に乗ると cream on red ≒ 4.42:1 かつ
赤面のノイズで実質可読性が崩れる。実機確認済み。

> デスクトップ（md 以上）は本文カラムと avatar が横並びになり、Proun は右上の余白に収まるため現状の構図が成立する。
> **問題はモバイル縦積み時のみ**。よって md 以上は現状維持、モバイルだけ赤ブロックを「下げる + 小さくする」。

### デザイン方針（構成主義を保つ）

Hero の骨格は「左下→右上の対角の力線」と「右上＝赤の主役正方形」（decoration.spec.md 参照）。
モバイルでもこの**対角と赤の主役性は維持**するが、赤ブロックを**小ラベルと H1 の右肩より下に逃がす**。
赤ブロックは H1（極大 cream）の**右上の角に半ば隠れて覗く**くらいの位置・サイズが、縦積みでは
むしろ「H1 の背後から赤が立ち上がる」構成主義的な前後関係になり望ましい。語彙は増やさない。

### 具体修正（Tailwind レスポンシブ接頭辞・モバイル既定 → `sm:`/`md:` で復元）

`AnimatedHero.tsx` の Proun ブロック群（L83-96）:

- **コンテナ**（現 `absolute top-0 right-0 w-80 h-80`）
  → `absolute top-24 right-0 w-56 h-56 sm:top-0 sm:w-80 sm:h-80`
  モバイルでは天井から 96px（`top-24`）下げ、小ラベル（y≈64）と H1 上端の下に逃がす。サイズも 320→224px に縮小。
  `sm:` 以上で従来値に復元。
- **赤ブロック**（現 `absolute top-4 right-0 w-52 h-52`）
  → `absolute top-4 right-0 w-36 h-36 sm:w-52 sm:h-52`
  モバイル 208→144px。`-6deg` 回転・`bg-constructivist-red` は維持。
- **黒ブロック**（現 `absolute top-20 right-12 w-24 h-24`）
  → `absolute top-12 right-8 w-16 h-16 sm:top-20 sm:right-12 sm:w-24 sm:h-24`
  コンテナ縮小に合わせ比率維持。
- **cream 円**（現 `absolute top-0 right-0 w-40 h-40`）
  → `absolute top-0 right-0 w-28 h-28 sm:w-40 sm:h-40`

> いずれも `pointer-events-none` / `aria-hidden`（既存）を維持。Proun はあくまで純装飾。
> `top-24`（96px）は「py-16=64px のパディング + 小ラベル行高 ~20px + 余白」を超える値で、被りを確実に解消する。

代替案（frontend が採るなら可）: コンテナを `top-24` で下げる代わりに、**赤ブロックだけ `top-28` 相当まで下げ**、
小ラベルと H1 の右側に余白の谷を作る方法でもよい。要件は「小ラベル行と赤面が縦方向で重ならない」こと。

---

## R2. モバイルの装飾密度 / cellSize（過密回避）

### 現状

`ConstructivistCanvas.tsx` の `cellSizeFor(width) = min(58, max(38, round(width/16)))`。
390px 幅では `390/16 ≈ 24` → 下限 `38` にクランプされる。タイル 1 マス = 38px。
セクション高さ（Hero `min-h-[90vh]` ≈ 780px、他 `py-20` セクション ~600px）に対し、
38px グリッドだと **横 ~10 列 × 縦 ~16〜20 行**。`sections.ts` の density（Skills 0.5 / Hero 0.36 等）と
掛け合わさると、狭い画面で**タイルが過密**になり、本文（z-10）の背後が視覚的にうるさくなる。

### 方針

モバイルでは**セルを大きく（＝タイル数を減らす）**し、密度感を下げる。
構成主義は「少数の大きな図形が対角に拮抗する」のが本来で、モバイルこそ**疎で大きい**方が語彙に忠実。
cellSize を上げると 1 タイルが大きくなり、同じ density でも**画面内のタイル総数が減る**＝過密が解消される。

### 具体修正案（`cellSizeFor` の改修）

現状は下限 38 に張り付くため、**狭幅ほどセルを相対的に大きくする**よう下限を引き上げる:

```ts
function cellSizeFor(width: number): number {
  // モバイル（狭幅）は大きめセル＝疎に。広幅は従来どおり width/16。
  if (width < 480) return 52;          // ~390px: タイル数を減らし過密回避
  if (width < 768) return 48;
  return Math.min(58, Math.max(40, Math.round(width / 16)));
}
```

- 390px 幅で 38→52 にすると横 ~7 列に減り、密度感が約 (38/52)² ≒ 0.53 倍に。
- 下限は 40 へ（従来 38 から微増）。最大 58 は維持。
- これは**装飾の見た目を「より大きく・より疎に」**する方向で、構成主義語彙に合致（プロトタイプ不要・1 関数の差し替え）。

> density 自体（`sections.ts`）はセクションの配色・構図意図に紐づくため**変更しない**。
> 過密対策は cellSize（タイル数）で行うのが副作用が少ない。Skills（density 0.5）が最も密なので、
> モバイルでの効きを優先確認すること。

---

## R3. タップ領域（最低 44×44px 目安）

### 現状の不足

- **モバイルメニューボタン**（Header L36-45）: `p-2`（8px）+ `w-6 h-6`（24px）= **40×40px**。44 未満。
- **モバイルメニュー項目**（Header L53-56）: `block px-3 py-2 text-sm` = 高さ ~8+8+20 ≈ **36px**。44 未満。
- **Hero CTA / リンク類**（GITHUB.COM/NIGOH 等）: テキスト + 楔のインライン。高さ ~24px で**タップ高が不足**。
- **デスクトップナビ**（Header L25-31, `px-3 py-2`）: sm 以上のみ表示なので、ポインタ環境。タップ要件の主対象外だが、
  タッチ対応ノート等を考えると `py-2`（高さ ~36px）はやや小さい。

### 方針（構成主義の余白・ボーダーを壊さず高さだけ確保）

タップ高は**縦パディングで稼ぐ**。横は詰めたままでよい（構成主義の密なグリッド感を保つ）。
角丸は付けない。背景/ボーダーは現状維持し、当たり判定だけ広げる。

具体:
- メニューボタン: `p-2` → `p-2.5`（10px）。`w-6 h-6` と合わせ **44×44**。または `min-h-11 min-w-11`（44px）を付与。
- モバイルメニュー項目: `py-2` → `py-3`（12px）。高さ ~44px。`block` 維持で行全体がタップ可能。
- Hero CTA（GITHUB.COM/NIGOH リンク）: リンク `a` に `py-2 -my-2`（当たり判定を上下に広げ、レイアウトは不変）または
  `inline-flex items-center min-h-11` を付与。楔 + テキストの見た目は変えない。
- Portfolio / Zenn カードリンクは `p-5`/`p-6` で既に十分（>44px）。変更不要。

---

## R4. 縦積み時の構図破綻チェック（モバイル）

- **Hero**: `flex-col md:flex-row`。モバイルは縦積み（テキスト→avatar）。R1 で赤ブロックを下げれば、
  「小ラベル → H1 → 赤帯 ROLE → 説明 → CTA → avatar」の縦の流れに、Proun 赤が H1 右肩から覗く構成で成立する。
  下部の区切り装飾（ダイヤ+線, L212）は縦積みでも「Hero を閉じる水平の底」として機能。維持。
- **About / AI / Portfolio**: `grid md:grid-cols-2` / `sm:grid-cols-N`。モバイルは 1 カラム縦積み。
  カード境界の `border-t-0` / `sm:border-l-0` ロジックは縦積みで連続ボーダーになるよう既に設計済み。
  **C-3b の黒パネル化後**、INTEREST&FOCUS は縦に黒パネル 3 連（モバイル `grid` 既定 1 列）。
  `border-t-0` の連結が黒パネル同士で効くか確認（黒地に cream 枠が連続する見えになる）。
- **セクション余白**: 全セクション `py-20`（80px）。モバイルでも過剰ではないが、Hero の `min-h-[90vh]` と
  合わせ縦に間延びしないか目視。必要なら Hero 本文の `py-16`（AnimatedHero L80）はモバイル維持で可。
- **赤い縦バー装飾**（About L231 / Portfolio L516, `w-2 h-full`）はモバイルでも端で細く立つだけで干渉なし。維持。

---

## 受入条件

### (A) モバイル / レスポンシブ
- [x] **R1**: モバイル幅 ~390px で Hero の赤 Proun ブロックが小ラベル「SOFTWARE ENGINEER — SAPPORO, JAPAN」と
      縦方向で重ならない（被りゼロ）。md 以上は従来の右上対角構図を維持。
      （コンテナ `top-24 ... sm:top-0`・赤 `w-36 sm:w-52` 等でモバイル既定を縮小+下げ、`sm:` で従来復元）
- [x] **R2**: モバイルで装飾タイルが過密でない（`cellSizeFor` がモバイルで ≥48px を返し、タイル数が減っている）。
      density は変更していない。本文テキスト（z-10）の背後が視覚的にうるさくない。
      （<480px=52 / <768px=48 / それ以上=従来 width/16 下限40）
- [x] **R3**: モバイルメニューボタン・メニュー項目・Hero CTA のタップ領域が ≥44×44px。
      構成主義の見た目（角丸なし・ボーダー・余白）は不変で、当たり判定のみ拡大。
      （ボタン `p-2.5`+`w-6 h-6`=44px / メニュー項目 `py-3`=~44px / Hero CTA `min-h-11`=44px）
- [x] **R4**: 縦積み時に各セクションの構図が破綻しない（Hero の対角、グリッドの連結ボーダー、黒パネル 3 連）。
      （INTEREST&FOCUS は `bg-constructivist-black` 化＋`border-t-0` 連結で黒パネル 3 連が縦に連続）
- [x] パレットは `constructivist.*` 内のみ。新色・角丸の導入なし。
- [ ] 上記はビジュアル回帰（モバイル幅スクショ）で目視確認。reduced-motion 時も静的フォールバックで構図が読める。

## 備考

- 本 spec の変更点は **Tailwind レスポンシブ接頭辞の追加（R1/R3）と `cellSizeFor` の 1 関数差し替え（R2）** が中心で、
  デスクトップの確定済み構図（decoration.spec.md の Hero/Career 受入）には影響しない。
- density（`sections.ts`）は configuration の意味論なので触らない。過密はタイル数（cellSize）で調整する。
