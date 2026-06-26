# Tiled ソース

構成主義タイル装飾（Phaser）が読み込む seed マップのソース。

## パイプライン

```
assets/tiled/  ──(オーサリング)──▶  public/tilemaps/*.json  ──load──▶  Phaser
```

- `public/tilemaps/<section>.json` は **Tiled 1.10 の JSON 形式**。Tiled エディタで開いて編集・再エクスポートできる。
- ランタイムでは `DecorationScene` が JSON の seed レイヤー（gid 配列）を読み、
  中央寄せでグリッドに焼き込む。残りは構成主義エージェントが build する。

## タイルセット（gid → 形状）

`firstgid = 1`。タイル画像はランタイムで Phaser Graphics から生成するため、
JSON 内の `image` 参照（`constructivist-tileset.png`）はプレースホルダ
（Tiled での見た目用。実描画には使わない）。

| gid | 形状 |
|-----|------|
| 1 | redSquare（赤い実心正方形） |
| 2 | blackSquare（黒い実心正方形） |
| 3 | hollowSquare（中空正方形） |
| 4 | circle（円） |
| 5 | arc（四分円） |
| 6 | diagonal（45° 斜線） |
| 7 | barV（縦の太線） |
| 8 | barH（横の太線） |
| 9 | dot（点） |

## 再生成

Tiled エディタを使わずに seed を作り直す場合:

```sh
node assets/tiled/gen-tilemaps.mjs public/tilemaps
```

色はここでは決めない（gid=形状のみ）。実際の配色は
`src/components/phaser/sections.ts` のセクション別パレットで決まる。
