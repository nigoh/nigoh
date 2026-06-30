# 3D Proun 装飾レイヤー（Three.js / 軸測）コンポーネント仕様

> ステータス: **実装済み（チューニング継続）** — `src/components/ProunCanvas.tsx`。
>
> 実装メモ（設計からの確定的な逸脱）:
> - **マテリアルは `MeshBasicMaterial`（平面フラット色）を採用**（spec 案の Lambert は陰面が灰色化し
>   cream が濁ったため）。El Lissitzky のポスター的平面性に合致。立体は軸測＋オーバーラップ＋稜線で読ませる。
>   黒い面は cream 稜線（`EdgesGeometry`）で暗背景に見せる。
> - **モバイル（< md / 768px）は装飾を出さない**（`hidden md:block`。three も読み込まない）。
>   縦積みの本文に背面装飾が重なり可読性を損なうため、spec の「モバイルは静的 SVG 可」をさらに進めて非表示に。
>   → Proun は**デスクトップ限定の showpiece**。
> - Hero の `AnimatedHero` が持っていた 2D Proun（赤ブロック＋円＋黒ブロック）は**削除**し、装飾を 3D に一本化。
> - レイヤー不透明度は 0.55→**0.95**（下げると cream が黒地に溶け灰色化するため。後退はマテリアル opacity と配置で担保）。
> 本書は「El Lissitzky / Proun を本気で吟味した Hero の 3D 背面装飾」の設計合意。
> 構図プロトタイプ（依存なし・SVG 軸測図解）: `prototypes/proun-3d-axonometric.html`。
> 既存 2D タイル装飾の基準: `specs/components/decoration.spec.md`（Hero 変奏節）。

## 目的

Hero（暗背景 `bg-constructivist-black` / `min-h-[90vh]`）の背面に、**El Lissitzky の Proun
（軸測投影・浮遊する基本幾何形・赤い楔・負空間の緊張）**を 3D で実装した showpiece 装飾を置く。
ユーザー要望「El Lissitzky のデザインをよく吟味して実装」「3D のオブジェがあるといい」に応える。
**本文（極大 H1「H.NIGO」・赤帯・avatar・説明文）の可読性を絶対に損なわない背面装飾**であること。

---

## El Lissitzky / Proun の一次調査（設計の根拠 — ぶらさない）

| 原則 | Proun での意味 | 本実装への落とし込み |
|------|---------------|--------------------|
| **軸測投影（axonometric / orthographic）** | 透視図法ではなく平行投影。消失点なし。 | **`OrthographicCamera` 必須**。`PerspectiveCamera` は不可。 |
| **上下の概念がない（neither top nor bottom）** | 重力が曖昧、幾何形が空間に浮遊。 | 立体は床に立たせない。負空間に浮遊。極ゆっくりの多軸ドリフト。 |
| **3D 負空間と平面的幾何形の緊張** | 薄い面・棒・円が傾いて交差し浮かぶ。負空間（余白）が主役。 | 少数の要素・大きな余白。立体は薄いスラブ・細い棒中心。 |
| **強い対角構造・赤い楔のアクセント** | 「赤い楔で白を撃て」。赤い楔が白い面に切り込む対角の動勢。 | 赤い三角柱（楔）が cream スラブへ対角に切り込む＝構図の核。 |
| **最小パレット・基本幾何形** | 棒・薄面・円盤・正方形・楔・線。 | 構成主義パレット内（後述）。形は 6〜7 種に限定。 |

代表作の参照: Proun 19D / 99 / Proun Room、「Beat the Whites with the Red Wedge」。

---

## 設計の決定事項

| 軸 | 決定 | 理由 |
|----|------|------|
| **配置セクション** | **Hero のみ**（showpiece）。他セクションは現状の 2D タイル維持。 | 3D は重い・掴みの主役。全セクション展開は性能と煩雑さで不採用。 |
| **Hero の 2D タイルとの関係** | **置換**（Hero では `ConstructivistCanvas section="hero"` を外し 3D に差し替え）。 | 2D タイル＋3D Proun の併存は同一ビューポートで装飾が二重化し煩雑。重心が割れる。 |
| **Contact への展開** | 当面しない。将来検討（静のセクションなので別案件）。 | 過剰実装回避。まず Hero を成立させる。 |
| **カメラ** | `OrthographicCamera`（軸測）。回転・ドリフトはオブジェクト側で行いカメラは固定。 | Proun の消失点なし。カメラを動かすと視差で透視感が出る。 |
| **モーション** | 非常にゆっくりした多軸ドリフト/微回転。スクロール連動は**しない**。 | 可読性優先。スクロール連動は H1 読書を妨げる。重力の曖昧さは緩慢な浮遊で表す。 |
| **存在感** | 低め。レイヤー不透明度 0.5 前後、本文カラム背後は空ける。 | 「気付いた人だけに伝わる」既存の装飾思想を踏襲。 |
| **フォールバック** | reduced-motion / WebGL 非対応 → **静的 SVG 軸測 Proun**。 | 既存 2D の `StaticComposition` と同思想。3D の初期姿勢を SVG で再現。 |
| **遅延ロード** | Three.js を動的 import（初期バンドル非搭載）。 | 既存 Phaser と同じ規律。 |

---

## 技術アーキテクチャ（確定・ぶらさない）

- **新規 React ラッパー** `src/components/ProunCanvas.tsx`（`ConstructivistCanvas.tsx` を雛形に）。
  Astro 側は Hero の `<ConstructivistCanvas section="hero" />` を `<ProunCanvas client:visible />` に**置換**。
- **遅延ロード**: `client:visible` でマウント、その時点で初めて `import('three')`。初期 JS に three を載せない。
- **オフスクリーン休止**: `IntersectionObserver` で可視外は `requestAnimationFrame` を止める（rAF ループを停止）。
- **WebGL レンダラ**: `WebGLRenderer({ antialias: true, alpha: true })`。背景は透明（下の `bg-constructivist-black` を活かす）。
- **DPR 上限**: `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`（モバイルのバッテリ保護）。
- **ライト**: `AmbientLight`（地）＋ `DirectionalLight` 1 灯（軸測の方向性陰影を与える）。多灯にしない。
- **マテリアル**: `MeshLambertMaterial`（マット・光沢なし）。`MeshStandardMaterial` の metalness/roughness は不要（Proun はマット）。
- **A11y**: ラッパー `div` は `aria-hidden="true"`、`pointer-events:none`。**スクロール・操作を一切奪わない**。

### カメラ（OrthographicCamera）パラメータ方針

```
frustumSize ≈ 10（シーンの「世界単位」基準。下記オブジェクト寸法はこの単位）
aspect = width / height
camera = new OrthographicCamera(
  -frustumSize*aspect/2,  frustumSize*aspect/2,
   frustumSize/2,        -frustumSize/2,
   0.1, 100 )
camera.position.set(8, 6, 8)   // 等角に近い斜め俯瞰（isometric寄り）
camera.lookAt(0, 0, 0)
```

- リサイズ時は `left/right/top/bottom` を aspect で更新し `updateProjectionMatrix()`。
- カメラは固定。視点を変えない（軸測の一貫性 ＝ 消失点なしを保つ）。

---

## シーン構成 — 浮遊する Proun オブジェクト（具体リスト）

> 世界単位は frustumSize=10 基準。座標 (x,y,z)。**右上〜中央右に重心**を寄せ、左下に楔の力線。
> **本文カラム（画面左〜中央上、極大 H1・赤帯）の背後は空ける** ＝ オブジェクトを画面左 1/3 上部に置かない。
> 数は **6〜7 個**に厳守（少数の要素・大きな余白）。色は `constructivist.*` のみ。

| # | 役割 | 形（Three.js geometry） | 寸法比 | 色（マテリアル color） | 初期姿勢（傾き） | 配置の意図 |
|---|------|------------------------|--------|----------------------|-----------------|-----------|
| A | 薄い大スラブ（cream 面） | `BoxGeometry` 薄板 | 4 × 0.12 × 2.6 | `#F5F0EB`（cream・不透明度 0.85） | rotate ~ (12°, 20°, -8°) | 平面と空間の緊張の核。中央右に浮遊。 |
| B | **赤い楔（アクセント）** | `CylinderGeometry`（radialSegments=3）または三角柱の `ExtrudeGeometry` | 高さ 0.4 / 断面 2.2 | `#D62828`（red） | スラブ A へ左上から対角に切り込む向き | 「赤い楔で白を撃て」。**構図の主役の動勢**。 |
| C | 細長い棒（直方体・cream） | `BoxGeometry` | 5 × 0.18 × 0.18 | `#F5F0EB`（cream・不透明度 0.7） | 左下→右上の対角（roll ~ -30°） | 線的力線。負空間を貫く。 |
| D | 黒い正方板（対の重み） | `BoxGeometry` 薄板 | 1.8 × 0.12 × 1.8 | `#1A1A1A`（black）＋ cream 細エッジ線（任意） | rotate ~ (-10°, 30°, 5°) | 二正方形の「黒」。赤の対。右上。負空間に半ば溶ける。 |
| E | 薄い円盤（red 輪郭） | `TorusGeometry`（太さ細）または `RingGeometry` の薄い円柱 | 半径 1.1 / 太さ 0.06 | `#D62828`（red） | 空間に立つ（面が斜め）| 運動。中央右やや上。 |
| F | 小さな赤い実心正方板 | `BoxGeometry` 小 | 0.7 × 0.1 × 0.7 | `#D62828`（red） | 楕 B と呼応する傾き | 左下のリズムの点景。楔と赤で呼応。 |
| G | 極細の cream 棒（任意・7個目） | `BoxGeometry` 極細 | 0.08 × 3.4 × 0.08 | `#F5F0EB`（cream・不透明度 0.3） | ほぼ縦のわずかな斜め | 右端で負空間を区切る一本の線。 |

- **darkgray `#3D3A37` の用途**: 各立体の陰面（DirectionalLight が当たらない側）に**自然に現れる**陰影として使う。
  独立した立体に darkgray を割り当てるのではなく、ライティングで明面（本来色）と暗面（暗くなった面）を出す。
- **角丸なし**: ベベル/フィレットは付けない。シャープエッジ厳守。
- **マット**: `MeshLambertMaterial`。鏡面ハイライトを出さない。

---

## モーション仕様（重力の曖昧さ ＝ 緩慢な浮遊）

- **多軸ドリフト/微回転**: 各オブジェクトを**非常にゆっくり**回す。`prefers-reduced-motion` 非該当時のみ。
  - 回転速度の目安: 各軸 **0.02〜0.06 rad/秒**（= 1 回転に 100〜300 秒）。過剰回転は厳禁。
  - 全オブジェクトを同期させない。各々わずかに異なる速度・軸で「漂う」非周期感を出す。
  - 任意で `position.y` を **±0.15 単位**の極めて浅い sin 揺れ（周期 12〜24 秒）で浮遊感を補強。
- **スクロール連動はしない**: H1 の読書を妨げる。Hero 内で完結する自律アニメのみ。
- **初期演出（任意）**: マウント時に各オブジェクトが最終姿勢へ静かにフェード/イーズイン（1 回・1〜1.5 秒）。
  これも reduced-motion 時は無効（最終姿勢を即時表示）。
- **fps**: 30〜60 で頭打ち。ドリフトが緩慢なので 30fps でも視覚的に滑らか。低性能端末では 30fps に間引いてよい。
- **reduced-motion 時**: rAF を回さず**静的フォールバック（SVG 軸測 Proun）**を出す（後述）。

---

## 可読性との両立（本文非干渉 — 最優先）

- **本文カラム背後を空ける**: 画面左〜中央上（極大 H1「H.NIGO」・赤帯 SOFTWARE ENGINEER の背後 ≒ 画面の左 45%・上 60%）には
  立体を置かない。Proun の重心は**右上〜中央右**（オブジェクト A/D/E/G）と**左下の楔の力線**（B/C/F は中央右〜左下を斜めに走るが、
  本文ブロックの直背後 ＝ 左上 1/3 には侵入させない）。
- **avatar（右中）と別重心**: AnimatedHero の avatar は右中にある。Proun の右上重心（A/D）と avatar の間に**余白の谷**を残す。
- **レイヤー不透明度**: 装飾全体を後退させる。canvas（または renderer の出力）を `opacity: 0.5` 前後で表示
  （既存 hero タイルの `opacity 0.5` と同等思想）。red の楔だけは構図の主役なので、レイヤー不透明度内で**最も視認される**配置にする。
- **被写界（任意）**: 軸測なので被写界深度（DOF）は使わない（透視感が出る）。代わりに**遠い要素ほど不透明度を下げる**手で奥行きを抑制してよい。
- **z-index**: Proun レイヤーは本文（`relative z-10`）より下層（`absolute inset-0`、z-0）。

### 配色・コントラスト（暗背景 #1A1A1A 上 / a11y）

- 装飾図形は**非テキスト・グラフィカル要素 ＝ 3:1 で十分**。本実装はテキストを一切含まない（aria-hidden）。
  - red `#D62828` on black ≒ **3.48:1** — 装飾として OK。赤い楔を主役にできる。
  - cream `#F5F0EB` on black ≒ **15.4:1** — 非常に明るい。**極大 cream H1 と競合**するため、cream のスラブ/棒は
    **不透明度を抑え（0.3〜0.85）、本文カラム背後に置かない**。これで H1 と混同しない。
  - darkgray `#3D3A37` — 陰面に使う。暗背景に沈むので本文を邪魔しない。
- **本文テキストのコントラストは装飾が背後で下げてはならない**: 本文は z-10 で上層、Proun は半透明で下層。
  H1（cream・極大）・赤帯（cream on red ≒ 4.42:1）・説明文（gray on black ≒ 4.82:1）はいずれも装飾と独立して AA を維持。

---

## フォールバック仕様

- **判定**: `prefers-reduced-motion: reduce`（`matchMedia`）または **WebGL 非対応**で 3D を起動せず静的表示。
- **静的フォールバック**: **SVG 軸測 Proun**（`prototypes/proun-3d-axonometric.html` の SVG を基準に
  `public/decoration-fallback/proun-hero.svg` を用意、または ProunCanvas 内でインライン SVG を描画）。
  - フォールバックでも「**赤い楔が cream スラブへ対角に切り込む / 右上の黒板 / 左下→右上の cream 棒の力線**」の
    Proun 構図が**静止で読める**こと。
  - SVG は等角投影（消失点なし）で 3D の初期姿勢を再現。色は constructivist パレットのみ。
- **WebGL フォールバック分岐**は既存 `ConstructivistCanvas` の `supportsWebGL()` をそのまま流用してよい。

---

## 性能上限の方針（モバイル配慮）

- **ポリゴン数**: 全オブジェクト合計で **数百〜2,000 三角形以内**。Box/Cylinder/Torus の低 segment で十分
  （Torus は radialSegments=8〜12, tubularSegments=24 程度）。重いジオメトリ・大量メッシュは不要（Proun は少数の要素）。
- **ライト**: AmbientLight 1 ＋ DirectionalLight 1 のみ。シャドウマップは**使わない**（コスト高・軸測の意匠に不要）。
- **DPR**: `min(devicePixelRatio, 2)`。
- **休止**: 可視外で rAF 停止。タブ非アクティブ（`visibilitychange`）でも停止。
- **モバイル**: 幅 < 480px ではオブジェクト数を **5 個に間引く**（G・F を落とす等）か、frustumSize を上げて全体を縮め余白を増やす。
  もしくはモバイルでは最初から静的 SVG フォールバックにしてもよい（性能優先。frontend が実機で判断）。
- **メモリ解放**: アンマウント時に geometry/material を `dispose()`、renderer を `dispose()`、canvas を除去。

---

## デザイン指針（まとめ）

- **軸測（OrthographicCamera）・消失点なし**を厳守。透視カメラは使わない。
- **少数の要素（6〜7）・大きな負空間**。語彙を増やさず、配色・傾き・配置で Proun を表現。
- **赤い楔の対角の動勢**を構図の核に。二正方形（赤・黒）の拮抗を 3D で反復。
- **マット・シャープエッジ・角丸なし**。光沢/ベベルを出さない。
- **背面・低存在感**。本文カラム背後を空け、不透明度で後退。H1 と重心をずらす。
- パレット外の色を導入しない（新色が要るなら本 spec に理由とトークン追加案を先に書く）。

---

## frontend 受け渡しチェックリスト（実装の入口）

- [ ] Hero の `<ConstructivistCanvas section="hero" />` を `<ProunCanvas client:visible />` に置換（他セクションの 2D タイルは維持）。
- [ ] `three` を動的 import（初期バンドル非搭載）。`OrthographicCamera`（透視カメラ不可）。
- [ ] オブジェクト A〜G を上表の形・寸法比・色・傾きで配置。重心を右上〜中央右に、楔の力線を左下に。本文カラム背後（左上 1/3）は空ける。
- [ ] AmbientLight + DirectionalLight 1 灯、`MeshLambertMaterial`（マット）。陰面に darkgray が自然に出る。
- [ ] 多軸ドリフト 0.02〜0.06 rad/s（過剰回転禁止）。スクロール連動なし。`prefers-reduced-motion` で rAF を回さず静的 SVG。
- [ ] WebGL 非対応 / reduced-motion → SVG 軸測 Proun フォールバック（`prototypes/proun-3d-axonometric.html` 基準）。
- [ ] DPR ≤ 2、シャドウなし、ポリゴン ≤ 2,000、可視外/タブ非表示で rAF 停止、アンマウントで dispose。
- [ ] ラッパーは `aria-hidden` / `pointer-events:none` / z-0、レイヤー不透明度 0.5 前後。

---

## 受入条件

- [ ] Hero 背面に軸測（消失点なし）の 3D Proun が表示され、赤い楔が cream スラブへ対角に切り込む動勢が読める。
- [ ] オブジェクトは 6〜7 個・大きな負空間が保たれ、語彙過多になっていない（Proun の「少数の要素」）。
- [ ] 極大 H1「H.NIGO」・赤帯・説明文・avatar の可読性が一切損なわれない（本文カラム背後に立体がない／レイヤー後退）。
- [ ] 本文テキストのコントラストが AA を維持（装飾は半透明・下層でこれを下げない）。
- [ ] モーションが緩慢な多軸ドリフトで、過剰回転・スクロール連動がない。重力の曖昧な浮遊感がある。
- [ ] `prefers-reduced-motion: reduce` で 3D が起動せず静的 SVG Proun が表示され、同じ Proun 構図が静止で読める。
- [ ] WebGL 非対応で静的 SVG フォールバックに分岐し破綻しない。
- [ ] 初期 JS バンドルに `three` が含まれない（遅延ロード）。可視外で rAF が停止する。
- [ ] DPR ≤ 2・シャドウなし・ポリゴン少数で、モバイルでも体感の重さがない。
- [ ] 色は constructivist パレット（red/black/cream/gray/darkgray）のみ。角丸なし・マット。
- [ ] `astro check` でエラーがない。
