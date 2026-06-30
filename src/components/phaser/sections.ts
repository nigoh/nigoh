// セクション別の「統一モチーフの変奏」設定。
// 同じタイル語彙を、配色重心・密度・エージェント数で各セクションに変奏する。
// 設計: specs/components/decoration.spec.md

export type Background = 'dark' | 'light';
export type ColorName = 'red' | 'black' | 'cream';

export interface SectionConfig {
  /** Tiled マップ JSON のキー（public/tilemaps/<key>.json） */
  key: string;
  /** 背景の明暗。タイルのコントラスト基調を決める */
  background: Background;
  /** 目標充填率 0..1（エージェントがここまでタイルを置こうとする） */
  density: number;
  /** エージェント数 */
  agents: number;
  /** タイル配色の重み（色選択の確率分布） */
  palette: Record<ColorName, number>;
  /** 形状の出現重み（構成主義の変奏） */
  shapeWeights: Partial<Record<ShapeName, number>>;
  /**
   * 装飾レイヤー全体の不透明度 0..1。装飾は純背景なので本文の可読性を最優先し、
   * 文字に埋もれない程度まで後退させる。本文が密なセクションほど低く。
   */
  opacity: number;
}

export type ShapeName =
  | 'redSquare'
  | 'blackSquare'
  | 'hollowSquare'
  | 'circle'
  | 'arc'
  | 'diagonal'
  | 'barV'
  | 'barH'
  | 'dot';

// Tiled タイルセットの gid → 形状（firstgid=1）
export const GID_TO_SHAPE: ShapeName[] = [
  'redSquare', // gid 1
  'blackSquare', // gid 2
  'hollowSquare', // gid 3
  'circle', // gid 4
  'arc', // gid 5
  'diagonal', // gid 6
  'barV', // gid 7
  'barH', // gid 8
  'dot', // gid 9
];

export const SECTIONS: Record<string, SectionConfig> = {
  hero: {
    key: 'hero',
    background: 'dark',
    density: 0.32,
    agents: 1,
    palette: { red: 0.6, black: 0.2, cream: 0.2 },
    shapeWeights: { redSquare: 4, diagonal: 3, circle: 2, dot: 2, blackSquare: 1, arc: 1 },
    opacity: 0.5,
  },
  about: {
    key: 'about',
    background: 'light',
    density: 0.18,
    agents: 1,
    palette: { red: 0.2, black: 0.65, cream: 0.15 },
    shapeWeights: { blackSquare: 2, barV: 2, barH: 1, diagonal: 2, dot: 1 },
    opacity: 0.45,
  },
  skills: {
    key: 'skills',
    background: 'dark',
    density: 0.3,
    agents: 1,
    // cream（明るい白枠）は本文の白文字と競合するので重みを下げ、赤を主役に
    palette: { red: 0.5, black: 0.2, cream: 0.3 },
    shapeWeights: { hollowSquare: 2, redSquare: 2, barH: 2, dot: 2, diagonal: 1 },
    opacity: 0.26,
  },
  ai: {
    key: 'ai',
    background: 'light',
    density: 0.3,
    agents: 2,
    palette: { red: 0.45, black: 0.4, cream: 0.15 },
    shapeWeights: { redSquare: 2, blackSquare: 2, circle: 2, dot: 2, diagonal: 1 },
    opacity: 0.4,
  },
  career: {
    key: 'career',
    background: 'dark',
    density: 0.26,
    agents: 1,
    palette: { red: 0.6, black: 0.1, cream: 0.3 },
    shapeWeights: { barV: 4, diagonal: 2, dot: 2, redSquare: 1, circle: 1 },
    opacity: 0.5,
  },
  portfolio: {
    key: 'portfolio',
    background: 'light',
    density: 0.3,
    agents: 1,
    palette: { red: 0.3, black: 0.55, cream: 0.15 },
    shapeWeights: { hollowSquare: 3, blackSquare: 1, diagonal: 1, dot: 2, barH: 1 },
    opacity: 0.4,
  },
  contact: {
    key: 'contact',
    background: 'dark',
    density: 0.14,
    agents: 0,
    palette: { red: 0.6, black: 0.1, cream: 0.3 },
    shapeWeights: { circle: 3, redSquare: 1, dot: 2 },
    opacity: 0.55,
  },
};

export function getSection(key: string): SectionConfig {
  return SECTIONS[key] ?? SECTIONS.hero;
}
