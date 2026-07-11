# Bauhaus Kinetic リデザイン 2026

## 目的

サイトのデザイン言語を **ロシア構成主義（エル・リシツキー）→ バウハウス（幾何・原色・キネティック）** へ刷新する。
1 ページ完結の静的サイトという構造・情報設計・アクセシビリティ契約・パフォーマンス設計はそのまま活かし、
「見え方（配色・書体構成・幾何ボキャブラリ・モーション）」を Bauhaus へ置き換える。

サイト所有者の承認済み方向性サンプル 06「Bauhaus Kinetic」（クリーム地に三原色の円・三角・帯、
回転する幾何形と極太タイポ）を本番へ展開したもの。

## パレット（唯一の出典 = `tailwind.config.mjs` の `bauhaus`）

三原色を核とする。core 5 色（red/black/cream/gray/darkgray）の hex は **不変** —
`specs/a11y.spec.md` のコントラスト契約を保つため。blue/yellow を装飾原色として **追加**する。

| 役割 | 名前 | hex | 備考 |
|---|---|---|---|
| 原色・赤 | `red` | `#D62828` | 主アクセント／アクション色（不変） |
| 原色・青 | `blue` | `#1E4FA8` | **新規**。暗色 → cream 文字が乗る |
| 原色・黄 | `yellow` | `#F1C12E` | **新規**。明色 → black 文字が乗る |
| 黒 | `black` | `#1A1A1A` | 地／インク（不変） |
| クリーム | `cream` | `#F5F0EB` | 地／インク（不変） |
| グレー | `gray` | `#8B8680` | 副次（不変） |
| ダークグレー | `darkgray` | `#3D3A37` | 副次（不変） |

- Tailwind: `bauhaus.*` が新しい出典。旧 `constructivist.*` は **同一オブジェクトのエイリアス**として残し、
  既存の `bg-constructivist-*` クラス（多数）を壊さない。新規コードは `bauhaus-*` を使う。
- CSS: `--red / --blue / --yellow / --black / --cream / --gray / --darkgray`（`theme()` 参照）。
- セマンティックトークン `--c-*`（役割 → hex・ライト/ダーク反転）と `--c-accent = red` は不変。
  red はサイト共通の「アクション/現在地」色として維持する（フォーカスリング・CTA・ホバー・ナビ現在地）。

## デザイン指針

- **幾何ボキャブラリ**: 円（disc/torus）・三角（三角柱）・帯（bar）を基本エレメントとする。
  角丸なし・シャープエッジ・アシンメトリック・大文字ボールドタイポ（Bebas Neue 見出し）。
- **三原色の配分（コントラスト前提）**: 細い要素・小マーカーで低コントラスト色を避ける。
  - 明地（cream）では **青・赤** が映える（黄の細線は不可）。
  - 暗地（black）では **黄・赤** が映える（青の細線は不可）。
- **セクション別の原色リズム**（索引順に R–Y–B を循環させ、Bauhaus の律動を作る）:

  | # | セクション | 地 | 原色 |
  |---|---|---|---|
  | 01 | HERO | 暗 | 三原色（円=黄／三角=青／帯=赤） |
  | 02 | ABOUT | 明 | 青 |
  | 03 | SKILLS | 暗 | 黄 |
  | 04 | AI | 明 | 赤（アイコンチップは三原色巡回） |
  | 05 | CAREER | 暗 | 黄（マーカーは赤/黄交互） |
  | 06 | PORTFOLIO | 明 | 青 |
  | 07 | CONTACT | 暗 | 三原色の締め（黄円環＋青块＋赤 CTA） |

- **モーション**: 既存のスクロール駆動・パララックス・キネティック機構をそのまま使う。
  Hero の Proun（`ProunCanvas`）は幾何コンポジション（黄円へ青三角が切り込む）としてスクロールで組み上がる。
  すべて `prefers-reduced-motion` で無効化し、静的な最終ポスターにフォールバックする（不変）。

## 実装対象

- `tailwind.config.mjs` — `bauhaus` パレット追加（blue/yellow）＋ `constructivist` エイリアス。
- `src/styles/global.css` — `--blue/--yellow` トークン、PosterIntro 組み上げ（青帯＋黄円＋赤块/斜線）、
  索引プレートのグリフ（三原色を巡回する実心円）。
- `src/components/ProunCanvas.tsx` — Hero 主役。円=黄／三角=青／帯=赤 に再配色・再形状。フォールバック SVG も対応。
- `src/components/SectionAccent.tsx` — 6 セクションの脇役 3D を上表の原色で配分。フォールバック SVG も対応。
- `src/pages/index.astro` — 見出し罫線・縦バー・装飾块・マーキー・AI チップ・Career マーカーを原色配分。
- `src/components/AnimatedSkillBar.tsx` — カテゴリ帯を三原色巡回（黄帯は暗字）。バー本体は暗地可読性のため赤を維持。
- `src/components/AnimatedHero.tsx` — 背景の巨大数字 01 を黄のゴースト化。

## 受入条件

- [x] `npx astro check` が 0 エラー（既存の JSON-LD hint 1 件のみ）。
- [x] `npm run build` が成功し、`bg-bauhaus-blue / bg-bauhaus-yellow / text-bauhaus-*` 等が生成 CSS に出力される。
- [x] Hero が三原色の幾何コンポジション（黄円・青三角・赤帯/円環）として表示される。
- [x] 各セクションの原色リズム（02 青・03 黄・04 赤・05 黄・06 青・07 三原色）がライト/ダーク両方で成立する。
- [x] AI アイコンチップが三原色を巡回し、黄チップは暗字でコントラストを確保する。
- [x] core 5 色の hex を変更していない（a11y コントラスト契約を保持）。`--c-accent = red` を維持。
- [x] `prefers-reduced-motion` で装飾が静止し、静的フォールバック（Proun/SectionAccent の SVG）に落ちる。
- [x] 既存の `bg-constructivist-*` クラスがエイリアスで引き続き解決される。
