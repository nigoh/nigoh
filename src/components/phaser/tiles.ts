// 構成主義プリミティブのタイルをランタイム生成する。
// Phaser.Graphics のベクタ描画 → generateTexture でテクスチャ化（Retina 用に 2x で描画）。
import Phaser from 'phaser';
import type { ColorName, ShapeName } from './sections';

export const COLORS: Record<ColorName, number> = {
  red: 0xd62828,
  black: 0x1a1a1a,
  cream: 0xf5f0eb,
};

export const ALL_SHAPES: ShapeName[] = [
  'redSquare',
  'blackSquare',
  'hollowSquare',
  'circle',
  'arc',
  'diagonal',
  'barV',
  'barH',
  'dot',
];

/** 形状に対して色が固定されているもの（語彙の意味を守る）。null なら配色から選ぶ。 */
const FIXED_COLOR: Partial<Record<ShapeName, ColorName>> = {
  redSquare: 'red',
  blackSquare: 'black',
};

export function tileTextureKey(shape: ShapeName, color: ColorName): string {
  return `tile_${shape}_${color}`;
}

export const AGENT_TEXTURE = 'agent_wedge';
export const GHOST_TEXTURE = 'issue_ghost';

/** このタイルが実際に使う色を決める（固定色があれば優先）。 */
export function resolveColor(shape: ShapeName, picked: ColorName): ColorName {
  return FIXED_COLOR[shape] ?? picked;
}

/**
 * 全 (形状 × 色) のテクスチャ + エージェント + ゴーストを生成。
 * @param scene 対象シーン
 * @param size  論理セルサイズ(px)。実テクスチャは res 倍で描く。
 * @param res   解像度倍率（DPR 上限つき）
 */
export function generateTextures(scene: Phaser.Scene, size: number, res: number): void {
  const S = Math.round(size * res);
  const colorNames: ColorName[] = ['red', 'black', 'cream'];

  for (const shape of ALL_SHAPES) {
    for (const color of colorNames) {
      const key = tileTextureKey(shape, color);
      if (scene.textures.exists(key)) continue;
      const g = scene.make.graphics({ x: 0, y: 0 }, false);
      drawShape(g, shape, COLORS[color], S);
      g.generateTexture(key, S, S);
      g.destroy();
    }
  }

  if (!scene.textures.exists(AGENT_TEXTURE)) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    drawAgent(g, S);
    g.generateTexture(AGENT_TEXTURE, S, S);
    g.destroy();
  }

  if (!scene.textures.exists(GHOST_TEXTURE)) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    drawGhost(g, S);
    g.generateTexture(GHOST_TEXTURE, S, S);
    g.destroy();
  }
}

function drawShape(g: Phaser.GameObjects.Graphics, shape: ShapeName, color: number, S: number): void {
  const p = Math.round(S * 0.14); // inset
  const t = Math.max(2, Math.round(S * 0.16)); // 太線
  const inner = S - p * 2;

  switch (shape) {
    case 'redSquare':
    case 'blackSquare':
      g.fillStyle(color, 1);
      g.fillRect(p, p, inner, inner);
      break;
    case 'hollowSquare':
      g.lineStyle(t * 0.55, color, 1);
      g.strokeRect(p + t * 0.3, p + t * 0.3, inner - t * 0.6, inner - t * 0.6);
      break;
    case 'circle':
      g.fillStyle(color, 1);
      g.fillCircle(S / 2, S / 2, inner / 2);
      break;
    case 'arc': {
      // 左上を中心とした四分円（運動感）
      g.fillStyle(color, 1);
      g.slice(p, p, inner, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(90), false);
      g.fillPath();
      break;
    }
    case 'diagonal':
      g.lineStyle(t, color, 1);
      g.beginPath();
      g.moveTo(p, S - p);
      g.lineTo(S - p, p);
      g.strokePath();
      break;
    case 'barV':
      g.fillStyle(color, 1);
      g.fillRect(Math.round(S / 2 - t / 2), 0, t, S);
      break;
    case 'barH':
      g.fillStyle(color, 1);
      g.fillRect(0, Math.round(S / 2 - t / 2), S, t);
      break;
    case 'dot':
      g.fillStyle(color, 1);
      g.fillCircle(S / 2, S / 2, Math.round(S * 0.15));
      break;
  }
}

/** エージェント = 赤い楔（右向き三角）+ 黒い視線ライン。angle で向きを変える。 */
function drawAgent(g: Phaser.GameObjects.Graphics, S: number): void {
  const p = Math.round(S * 0.2);
  g.fillStyle(COLORS.red, 1);
  g.beginPath();
  g.moveTo(p, p);
  g.lineTo(S - p, S / 2);
  g.lineTo(p, S - p);
  g.closePath();
  g.fillPath();
  g.lineStyle(Math.max(2, S * 0.06), COLORS.black, 1);
  g.beginPath();
  g.moveTo(S / 2, S / 2);
  g.lineTo(S - p, S / 2);
  g.strokePath();
}

/** Issue ゴースト = 破線風の薄い輪郭（実装待ちの輪郭タイル）。 */
function drawGhost(g: Phaser.GameObjects.Graphics, S: number): void {
  const p = Math.round(S * 0.16);
  g.lineStyle(Math.max(2, S * 0.05), COLORS.red, 0.85);
  g.strokeRect(p, p, S - p * 2, S - p * 2);
  // 角の強調
  const c = Math.round(S * 0.12);
  g.lineStyle(Math.max(2, S * 0.07), COLORS.red, 1);
  for (const [x, y, dx, dy] of [
    [p, p, 1, 1],
    [S - p, p, -1, 1],
    [p, S - p, 1, -1],
    [S - p, S - p, -1, -1],
  ] as const) {
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + dx * c, y);
    g.moveTo(x, y);
    g.lineTo(x, y + dy * c);
    g.strokePath();
  }
}
