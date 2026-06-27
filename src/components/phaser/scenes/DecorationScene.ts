// セクション装飾の共通シーン。セクション設定 + Tiled seed マップで差分化する。
import Phaser from 'phaser';
import { Agent, type AgentContext } from '../agent';
import { Grid, type Cell } from '../grid';
import { GID_TO_SHAPE, getSection, type ColorName, type SectionConfig } from '../sections';
import {
  generateTextures,
  resolveColor,
  tileTextureKey,
  GHOST_TEXTURE,
} from '../tiles';

export interface TiledMap {
  width: number;
  height: number;
  layers: Array<{ data?: number[]; width?: number; height?: number; type: string }>;
}

export interface SceneData {
  sectionKey: string;
  mapData: TiledMap | null;
  cellSize: number;
  res: number;
}

export class DecorationScene extends Phaser.Scene {
  private section!: SectionConfig;
  private mapData: TiledMap | null = null;
  private cellSize = 48;
  private res = 1;

  private grid!: Grid;
  private cols = 0;
  private rows = 0;
  private offsetX = 0;
  private offsetY = 0;

  private tileSprites = new Map<string, Phaser.GameObjects.Image>();
  private ghosts = new Map<string, Phaser.GameObjects.Image>();
  private issueQueue: Array<[number, number]> = [];
  private agents: Agent[] = [];

  constructor() {
    super({ key: 'DecorationScene' });
  }

  init(data: SceneData): void {
    this.section = getSection(data.sectionKey);
    this.mapData = data.mapData;
    this.cellSize = data.cellSize;
    this.res = data.res;
  }

  create(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    this.cols = Math.max(1, Math.floor(w / this.cellSize));
    this.rows = Math.max(1, Math.floor(h / this.cellSize));
    this.offsetX = Math.round((w - this.cols * this.cellSize) / 2);
    this.offsetY = Math.round((h - this.rows * this.cellSize) / 2);

    generateTextures(this, this.cellSize, this.res);
    this.grid = new Grid(this.cols, this.rows);

    this.seedFromMap();
    this.spawnAgents();

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.onPointer(p));
  }

  update(time: number, delta: number): void {
    for (const a of this.agents) a.update(time, delta);
  }

  private key(c: number, r: number): string {
    return `${c},${r}`;
  }

  private cellCenter(c: number, r: number): { x: number; y: number } {
    return {
      x: this.offsetX + c * this.cellSize + this.cellSize / 2,
      y: this.offsetY + r * this.cellSize + this.cellSize / 2,
    };
  }

  /** Tiled seed を中央寄せでグリッドに焼き込む。 */
  private seedFromMap(): void {
    const layer = this.mapData?.layers.find((l) => l.type === 'tilelayer' && l.data);
    if (!layer?.data) return;
    const mw = layer.width ?? this.mapData!.width;
    const mh = layer.height ?? this.mapData!.height;
    const offC = Math.floor((this.cols - mw) / 2);
    const offR = Math.floor((this.rows - mh) / 2);
    const accent = this.dominantColor();

    for (let mr = 0; mr < mh; mr++) {
      for (let mc = 0; mc < mw; mc++) {
        const gid = layer.data[mr * mw + mc];
        if (!gid) continue;
        const shape = GID_TO_SHAPE[gid - 1];
        if (!shape) continue;
        const c = offC + mc;
        const r = offR + mr;
        if (!this.grid.isEmpty(c, r)) continue;
        this.placeTile(c, r, { shape, color: resolveColor(shape, accent) }, false);
      }
    }
  }

  private dominantColor(): ColorName {
    const p = this.section.palette;
    return (Object.entries(p).sort((a, b) => b[1] - a[1])[0]?.[0] as ColorName) ?? 'red';
  }

  private spawnAgents(): void {
    for (let i = 0; i < this.section.agents; i++) {
      const c = Math.floor((this.cols * (i + 1)) / (this.section.agents + 1));
      const r = Math.floor(this.rows / 2);
      this.agents.push(new Agent(this.agentContext(), c, r));
    }
  }

  private agentContext(): AgentContext {
    return {
      scene: this,
      grid: this.grid,
      section: this.section,
      cellSize: this.cellSize,
      cellCenter: (c, r) => this.cellCenter(c, r),
      placeTile: (c, r, cell) => this.placeTile(c, r, cell, true),
      takeIssue: (c, r) => this.takeIssue(c, r),
    };
  }

  /** タイル設置。animate=true で pop-in、ゴースト除去も行う。 */
  private placeTile(c: number, r: number, cell: Cell, animate: boolean): void {
    if (!this.grid.isEmpty(c, r)) return;
    this.grid.set(c, r, cell);

    const { x, y } = this.cellCenter(c, r);
    const img = this.add
      .image(x, y, tileTextureKey(cell.shape, cell.color))
      .setDisplaySize(this.cellSize, this.cellSize)
      .setDepth(10);
    this.tileSprites.set(this.key(c, r), img);

    // ゴースト除去
    const gk = this.key(c, r);
    const ghost = this.ghosts.get(gk);
    if (ghost) {
      ghost.destroy();
      this.ghosts.delete(gk);
    }

    if (animate) {
      const bx = img.scaleX;
      const by = img.scaleY;
      img.setScale(bx * 0.25, by * 0.25);
      this.tweens.add({
        targets: img,
        scaleX: bx,
        scaleY: by,
        duration: 240,
        ease: 'Back.easeOut',
      });
    }
  }

  private onPointer(p: Phaser.Input.Pointer): void {
    const c = Math.floor((p.x - this.offsetX) / this.cellSize);
    const r = Math.floor((p.y - this.offsetY) / this.cellSize);
    if (!this.grid.isEmpty(c, r)) return;
    const gk = this.key(c, r);
    if (this.ghosts.has(gk)) return;

    const { x, y } = this.cellCenter(c, r);
    const ghost = this.add
      .image(x, y, GHOST_TEXTURE)
      .setDisplaySize(this.cellSize, this.cellSize)
      .setDepth(5)
      .setAlpha(0.9);
    this.tweens.add({
      targets: ghost,
      alpha: 0.45,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.ghosts.set(gk, ghost);
    this.issueQueue.push([c, r]);
  }

  /** agent に最も近い Issue を取り出して占有する。 */
  private takeIssue(ac: number, ar: number): [number, number] | null {
    if (this.issueQueue.length === 0) return null;
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < this.issueQueue.length; i++) {
      const [c, r] = this.issueQueue[i];
      const d = Math.abs(c - ac) + Math.abs(r - ar);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    const [claimed] = this.issueQueue.splice(bestIdx, 1);
    return claimed;
  }
}
