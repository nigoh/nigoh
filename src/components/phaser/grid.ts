// グリッドモデル + 構成主義ヒューリスティク。
// エージェントが「良い」セル・タイルを選ぶための評価を提供する。
import type { ColorName, SectionConfig, ShapeName } from './sections';
import { resolveColor } from './tiles';

export interface Cell {
  shape: ShapeName;
  color: ColorName;
}

export class Grid {
  readonly cols: number;
  readonly rows: number;
  private cells: (Cell | null)[];

  constructor(cols: number, rows: number) {
    this.cols = cols;
    this.rows = rows;
    this.cells = new Array(cols * rows).fill(null);
  }

  private idx(c: number, r: number): number {
    return r * this.cols + c;
  }

  inBounds(c: number, r: number): boolean {
    return c >= 0 && c < this.cols && r >= 0 && r < this.rows;
  }

  get(c: number, r: number): Cell | null {
    return this.inBounds(c, r) ? this.cells[this.idx(c, r)] : null;
  }

  set(c: number, r: number, cell: Cell | null): void {
    if (this.inBounds(c, r)) this.cells[this.idx(c, r)] = cell;
  }

  isEmpty(c: number, r: number): boolean {
    return this.inBounds(c, r) && this.cells[this.idx(c, r)] === null;
  }

  filledCount(): number {
    let n = 0;
    for (const cell of this.cells) if (cell) n++;
    return n;
  }

  fillRatio(): number {
    return this.filledCount() / this.cells.length;
  }

  colorCount(color: ColorName): number {
    let n = 0;
    for (const cell of this.cells) if (cell?.color === color) n++;
    return n;
  }

  emptyCells(): Array<[number, number]> {
    const out: Array<[number, number]> = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.cells[this.idx(c, r)] === null) out.push([c, r]);
      }
    }
    return out;
  }

  filledNeighbors(c: number, r: number): number {
    let n = 0;
    if (this.get(c - 1, r)) n++;
    if (this.get(c + 1, r)) n++;
    if (this.get(c, r - 1)) n++;
    if (this.get(c, r + 1)) n++;
    return n;
  }
}

/**
 * 構成主義ヒューリスティクでセルを評価。高いほど「良い」配置。
 * - 回転対称: 中心 180° の対点が埋まっていれば動的バランスを評価
 * - 連結性: 隣接が 1 個のときに最も高く（孤立も団子も避ける）
 * - 中心回避: ど真ん中の的当ては避ける
 */
function scoreCell(grid: Grid, c: number, r: number): number {
  let score = 0;

  // 回転対称の対点
  const oc = grid.cols - 1 - c;
  const or = grid.rows - 1 - r;
  if (grid.get(oc, or)) score += 2.0;

  // 連結性（1 隣接が最良）
  const nb = grid.filledNeighbors(c, r);
  score += nb === 1 ? 1.5 : nb === 2 ? 0.6 : nb === 0 ? 0.3 : -0.8;

  // 中心回避（中心からの正規化距離を弱く加点）
  const dx = (c - (grid.cols - 1) / 2) / grid.cols;
  const dy = (r - (grid.rows - 1) / 2) / grid.rows;
  score += Math.sqrt(dx * dx + dy * dy) * 0.8;

  // 対角線上を弱く優遇（力線）
  if (Math.abs(c - r) <= 1 || Math.abs(c - (grid.rows - 1 - r)) <= 1) score += 0.4;

  return score;
}

/** 空きセルからサンプリングし、ヒューリスティク最良のセルを返す。 */
export function chooseTargetCell(grid: Grid, sampleSize = 14): [number, number] | null {
  const empties = grid.emptyCells();
  if (empties.length === 0) return null;

  const sample =
    empties.length <= sampleSize ? empties : pickRandomSubset(empties, sampleSize);

  let best: [number, number] | null = null;
  let bestScore = -Infinity;
  for (const [c, r] of sample) {
    const s = scoreCell(grid, c, r) + Math.random() * 0.5; // 少しのゆらぎ
    if (s > bestScore) {
      bestScore = s;
      best = [c, r];
    }
  }
  return best;
}

/** セクション設定からタイル（形状+色）を選ぶ。赤黒の拮抗を保つよう補正。 */
export function chooseTile(grid: Grid, section: SectionConfig): Cell {
  const shape = pickWeighted(section.shapeWeights as Record<string, number>) as ShapeName;

  // 赤黒の拮抗: 偏っている色をやや抑制
  const palette = { ...section.palette };
  const red = grid.colorCount('red');
  const black = grid.colorCount('black');
  if (red > black + 4) palette.red *= 0.5;
  if (black > red + 4) palette.black *= 0.5;

  const picked = pickWeighted(palette as Record<string, number>) as ColorName;
  return { shape, color: resolveColor(shape, picked) };
}

function pickWeighted(weights: Record<string, number>): string {
  const entries = Object.entries(weights).filter(([, w]) => w > 0);
  const total = entries.reduce((a, [, w]) => a + w, 0);
  let roll = Math.random() * total;
  for (const [k, w] of entries) {
    roll -= w;
    if (roll <= 0) return k;
  }
  return entries[entries.length - 1][0];
}

function pickRandomSubset<T>(arr: T[], n: number): T[] {
  const out: T[] = [];
  const used = new Set<number>();
  while (out.length < n && used.size < arr.length) {
    const i = Math.floor(Math.random() * arr.length);
    if (!used.has(i)) {
      used.add(i);
      out.push(arr[i]);
    }
  }
  return out;
}
