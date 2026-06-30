# Polish / 全体一貫性 仕様（Round 5）

> ステータス: **是正方針確定**。実装は frontend が `src/**` で行う。
> 対象: `src/pages/index.astro`・`src/components/AnimatedHero.tsx`・`src/components/phaser/sections.ts`。
> 前提: R1 Career / R2 Hero / R3 a11y / R4 モバイル&可視性 は完了済み。本書は **最小差分で全体の締まりを上げる** ことだけを扱う。コントラスト・レスポンシブ・reduced-motion は既存 spec（a11y / responsive / decoration）が基準で、ここでは再検証しない。

---

## 0. 結論サマリ（過剰変更を避ける判断）

点検の結果、**大半の観点は既に一貫しており是正不要**。下記は「現状で十分」と明記する:

- **h2 セクション見出し**: 全 7 セクション `font-sans text-5xl sm:text-6xl tracking-tight`。サイズ・字間・フォントは完全一致。**変更不要**。
- **セクション縦リズム**: 全セクション `py-20`（Hero のみ `min-h-[90vh]`）。サブブロック上マージンも `mt-16` で統一（Skills GitHub / AI Focus / Portfolio Zenn）。**変更不要**。
- **明暗交替**: hero(dark) → about(light) → skills(dark) → ai(light) → career(dark) → portfolio(light) → contact(dark)。完全な交互。**変更不要**。
- **eyebrow ラベル**（`text-xs font-bold uppercase tracking-widest font-body`）: About dt / Skills GitHub / AI Focus / Portfolio Zenn で完全一致。**変更不要**。
- **赤いエッジ帯の左右非対称**: About 左 (`w-2 left-0`) / Portfolio 右 (`w-2 right-0`) は意図的な対角ミラー。動的アシンメトリとして**正しく、維持**。

是正対象は **下記 3 点のみ**（うち P1 が本命）。

---

## 1. 是正方針

### P1（推奨・本命）— カード見出し h3 のサイズ統一

**現状の不整合**: 視覚的に等価な「2 カラム枠付きカードのタイトル」が、セクションごとに別サイズになっている。

| 場所 | 要素 | 現状 class |
|---|---|---|
| AI セクション 4 カード | `<h3>` COPILOT 等 | `font-sans text-xl tracking-wide` |
| Portfolio 4 カード | `<h3>` プロジェクト名 | `font-sans text-2xl tracking-wide` |
| AI Focus 3 枠 | `<h4>` RAG 等 | `font-sans text-base tracking-wide` |
| Career 6 エントリ | `<h3>` 業種 | `font-sans text-lg tracking-wide` |

AI カードと Portfolio カードは**同じ「枠付き 2 カラムグリッドのカード」という同一パターン**なのに `text-xl` と `text-2xl` で割れている。ここを揃えると面のリズムが締まる。

**方針（タイポスケールの確定）**: カード／見出しの第 2 階層スケールを下記に固定する。

| 役割 | サイズトークン | 適用先 |
|---|---|---|
| 主カードタイトル（枠付き 2 カラムカード） | `text-2xl tracking-wide` | **AI 4 カード** と Portfolio 4 カード |
| 副カードタイトル（小さい入れ子枠） | `text-base tracking-wide` | AI Focus 3 枠（現状維持） |
| タイムライン項目見出し | `text-lg tracking-wide` | Career 業種（現状維持） |

→ **変更するのは AI の 4 枚だけ**: `index.astro` の AI カード `<h3>`（COPILOT SWE AGENT / OPENAI CODEX / MCP / AGENT CONFIG）の `text-xl` → `text-2xl`。

**理由**: AI と Portfolio は構造（枠 + 2 カラム + ホバー反転）が同一。タイトルサイズを合わせることで「同じ部品の変奏」として読め、構成主義の語彙統一に沿う。Career はタイムラインで部品が異なるため `text-lg` のまま、Focus は入れ子の小枠なので `text-base` のまま据え置き、過剰な平準化を避ける。

> 注意: AI カードはアイコンと同じ flex 行に並ぶ。`text-xl`→`text-2xl` で行高が僅かに増えるが、`w-10 h-10` アイコンが基準なので破綻しない。狭幅でもカード幅は変わらず折り返すだけ。

### P2（推奨）— Skills 装飾密度の引き下げ（過密の是正）

**現状の不整合**: `sections.ts` の `density` を内容量・明暗で並べると Skills が突出。

| section | bg | density | 内容量 |
|---|---|---|---|
| skills | dark | **0.50** | 最大（6 スキル群 + GitHub 活動ブロック一式） |
| hero | dark | 0.36 | （R2 調整済） |
| ai | light | 0.34 | 高（4 カード + 3 枠） |
| portfolio | light | 0.32 | 高（4 カード + 6 Zenn） |
| career | dark | 0.28 | （R1 調整済） |
| about | light | 0.18 | 中 |
| contact | dark | 0.14 | 最小 |

Skills は**最も本文が密なセクション**なのに装飾密度も**全体最大の 0.50**。密な内容の背後を密に埋めると過飽和し、スキルバー（情報）と装飾（純装飾）が視覚的に競合する。他の dark セクション（career 0.28 / contact 0.14）との段差も大きい。

**方針**: `skills.density` を **0.50 → 0.40** に下げる。これで dark 群（hero 0.36 / skills 0.40 / career 0.28 / contact 0.14）の中で「情報量が最大の skills が最も装飾を主張する」という逆転を緩和しつつ、Skills を引き続き「最も賑やかな dark 面」に保てる（hero に次ぐ、ではなく hero と並ぶ最上位に維持）。

> palette / shapeWeights は変更しない（cream 0.5 重心の "明るく軽い skills トーン" は維持）。density のみ。

### P3（任意・低優先）— About 内部アクセントバーの色

**現状**: `border-l-4` の sub-block アクセントが、About 基本情報ブロックだけ `border-constructivist-black`、Skills GitHub と AI Focus は `border-constructivist-red`。

**判断**: これは **是正不要寄り**。About のそれは「データ（dl）の縦罫」で赤アクセントとは役割が異なり、明背景で黒罫は構成主義的に正当。赤に揃えると About 左の `w-2` 赤エッジ帯と二重赤になり、むしろ過剰。**現状維持を推奨**。記録のみ。

---

## 2. 触ってよいトークン / 制約

- パレットは `constructivist.*`（red `#D62828` / black `#1A1A1A` / cream `#F5F0EB` / gray `#8B8680` / darkgray `#3D3A37`）のみ。**新色なし**。
- フォントトークン（sans / body / mono）変更なし。
- サイズは Tailwind 既定スケール内（`text-2xl` 等）。任意値（`text-[...]`）の新規追加なし。
- `density` は 0..1 の既存フィールド。今回触るのは `skills` のみ。

## 3. 受入条件

- [x] AI セクションの 4 カード `<h3>` が `text-2xl`（Portfolio カードと同寸）になっている。
- [x] AI Focus（`text-base`）/ Career 業種（`text-lg`）は変更されていない（過剰平準化していない）。
- [x] `sections.ts` の `skills.density` が `0.40`。他セクションの density / palette / shapeWeights は不変。
- [x] h2・py-20・mt-16・eyebrow ラベルは一切変更されていない（既に一貫しているため）。
- [x] 変更後も明暗交替・赤エッジ帯の左右非対称・各セクションのコントラストが R3/R4 の状態を維持。
- [x] パレット外の色・新フォント・新規任意値クラスが導入されていない。
