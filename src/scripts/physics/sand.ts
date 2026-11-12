// 砂のセル・オートマトン（specs/physics-2026.spec.md「共通」）。
// 重力の向きの先にある粒から順に、空いたマスへ 1 マスずつ動かす（真っ直ぐ → 斜め 2 方向）。
// 斜めは、重力の角度に近いほうを先に試す。固まった粒（stuck）は動かない。
import { grainPalette } from './colors';

const DIRS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
];

export class Sand {
  readonly w: number;
  readonly h: number;
  readonly cells: Uint8Array;
  readonly stuck: Uint8Array;
  private readonly mark: Uint8Array;
  private t = 1;
  count = 0;

  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.cells = new Uint8Array(w * h);
    this.stuck = new Uint8Array(w * h);
    this.mark = new Uint8Array(w * h);
  }

  add(x: number, y: number, v: number, stuck = false): boolean {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return false;
    const i = y * this.w + x;
    if (this.cells[i]) return false;
    this.cells[i] = v;
    this.stuck[i] = stuck ? 1 : 0;
    this.count++;
    return true;
  }

  clear(): void {
    this.cells.fill(0);
    this.stuck.fill(0);
    this.count = 0;
  }

  /** 円の中の固まった粒をほどく */
  loosen(cx: number, cy: number, r: number): void {
    for (let y = cy - r; y <= cy + r; y++) {
      for (let x = cx - r; x <= cx + r; x++) {
        if (x < 0 || y < 0 || x >= this.w || y >= this.h) continue;
        if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) this.stuck[y * this.w + x] = 0;
      }
    }
  }

  /** 1 段すすめる。動いた粒の数を返す */
  step(gx: number, gy: number): number {
    const mag = Math.min(1, Math.hypot(gx, gy));
    if (mag < 0.08) return 0;
    const q = Math.atan2(gy, gx) / (Math.PI / 4);
    const k0 = Math.round(q);
    const res = q - k0;
    const k = ((k0 % 8) + 8) % 8;
    const P = DIRS[k];
    const A = DIRS[(k + 1) % 8];
    const B = DIRS[(k + 7) % 8];
    const { w, h, cells: c, stuck: st, mark: mk } = this;
    this.t = this.t >= 255 ? 1 : this.t + 1;
    const t = this.t;
    const flip = (t & 1) === 1;
    let moved = 0;

    const free = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < w && y < h && !c[y * w + x];
    const cell = (x: number, y: number): void => {
      const i = y * w + x;
      if (!c[i] || st[i] || mk[i] === t) return;
      if (Math.random() > mag) return;
      let d: readonly [number, number] | null = null;
      if (free(x + P[0], y + P[1])) d = P;
      else {
        const first = Math.random() < 0.5 + res ? A : B;
        const second = first === A ? B : A;
        if (free(x + first[0], y + first[1])) d = first;
        else if (free(x + second[0], y + second[1])) d = second;
      }
      if (!d) return;
      const j = (y + d[1]) * w + (x + d[0]);
      c[j] = c[i];
      c[i] = 0;
      mk[j] = t;
      moved++;
    };

    if (Math.abs(gy) >= Math.abs(gx)) {
      const down = gy > 0;
      for (let y = down ? h - 1 : 0; down ? y >= 0 : y < h; y += down ? -1 : 1) {
        for (let n = 0; n < w; n++) cell(flip ? n : w - 1 - n, y);
      }
    } else {
      const right = gx > 0;
      for (let x = right ? w - 1 : 0; right ? x >= 0 : x < w; x += right ? -1 : 1) {
        for (let n = 0; n < h; n++) cell(x, flip ? n : h - 1 - n);
      }
    }
    return moved;
  }

  /** 1 マス＝1 画素で書く（CSS で拡大し、image-rendering: pixelated で角を立てる） */
  draw(ctx: CanvasRenderingContext2D, img: ImageData): void {
    const d = img.data;
    const c = this.cells;
    for (let i = 0; i < c.length; i++) {
      const v = c[i];
      const o = i * 4;
      if (v) {
        const p = v * 4;
        d[o] = grainPalette[p];
        d[o + 1] = grainPalette[p + 1];
        d[o + 2] = grainPalette[p + 2];
        d[o + 3] = 255;
      } else {
        d[o + 3] = 0;
      }
    }
    ctx.putImageData(img, 0, 0);
  }
}
